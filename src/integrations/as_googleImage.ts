import axios from "axios";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { as_mssql } from "@root/models";
import { ASGOOGLE_KEY } from "@root/interfaces";
import { IRecordSet } from "mssql";
import { as_Puppeteer } from '@root/utils';

const googleApi = axios.create({
  baseURL: "https://www.googleapis.com/customsearch/v1",
});

type resImage = {
    statusCode: number,
    url: string | null,
    message: string,
    origin: string,
}


const as_URLExists = async (url: string) => {
  
  const puppeteer = new as_Puppeteer()
  try {
    const puppeteer = new as_Puppeteer()
    const page = await puppeteer.openBrowser(); 
    const response = await page.goto(url, { waitUntil: 'load' });
    return response?.status() == StatusCodes.OK
    
  } catch (error) {
    console.log(error)
    return false;
  } finally {
    await puppeteer.closeBrowser()
  }
  
}

export const as_fetchImageFromGoogle = async (ean: string): Promise<resImage> => {
  
   let image: resImage = {
    statusCode: StatusCodes.NOT_FOUND,
    url: null,
    message: getReasonPhrase(StatusCodes.NOT_FOUND),
    origin: 'Google'
  };

  try {
    const url = `https://cdn-cosmos.bluesoft.com.br/products/${ean}`;
    const exists = await as_URLExists(url);
    if (exists) {
      image.url = url
      image.statusCode = StatusCodes.OK
      image.message = getReasonPhrase(StatusCodes.OK)
      image.origin = 'Bluesoft'
    }
    
  } catch (error) {
    console.log('error: ', error)
  }
  
  // console.log(image)
  if (image.origin === 'Bluesoft') return image;

  let query = `
    SELECT TOP 1 * FROM AS_API..ASGOOGLE_KEY WITH (NOLOCK) 
     WHERE GOGDDATEXP < GETDATE() - 1
        OR GOGDDATEXP IS NULL
    ORDER BY GOGDDATCAD  
  `
  const keys: IRecordSet<ASGOOGLE_KEY>  = (await as_mssql.Assqlexec(query)).recordset ;

  if (!keys || keys.length === 0) {
    image.statusCode = StatusCodes.TOO_MANY_REQUESTS
    image.message = getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS)
    return image
  }

   try {
        const response = await googleApi.get("", {
        params: {
            key: keys[0].GOGCCODKEY,
            cx: keys[0].GOGCCOD_CX,
            q: ean,
            searchType: "image",
            num: 1,
        },
        });

        image.url = response.data.items?.[0]?.link || null;
        if (image.url) {
            image.statusCode = StatusCodes.OK
            image.message = getReasonPhrase(StatusCodes.OK)
        };
        
    } catch (error: any) {
        // console.error("Erro ao buscar imagem:", error.response?.data || error.message);
        image.statusCode = error.response?.data.error.code
        image.message = error.response?.data.error.message
    }

    if (image.statusCode === StatusCodes.TOO_MANY_REQUESTS) {
        
        query = `
            UPDATE AS_API..ASGOOGLE_KEY SET GOGDDATEXP = GETDATE() WHERE GOGCUIDGOG = '${keys[0].GOGCUIDGOG}'
        `
        await as_mssql.Assqlexec(query);
    }


  return image;
};
