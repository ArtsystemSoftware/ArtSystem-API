import { as_Puppeteer } from '@root/utils';
import { ViaCep } from '@root/interfaces';

type Address = Partial<ViaCep> & {address?: string}
type TravelMode = 
  | { mode: "driving" }
  | { mode: "walking" }
  | { mode: "bicycling" }
  | { mode: "two-wheeler" }
//   | { 
//       mode: "transit";
//       transitModes?: TransitMode[];
//     };

type TransitMode = 
  | "bus"
  | "subway"
  | "train"
  | "tram"
  | "rail";

const as_googleGeoLocation = async (origin: Address, destination: Address) => {

    const puppeteer = new as_Puppeteer()
    try {
    
    const page = await puppeteer.openBrowser();
    const travelmode: TravelMode = {mode: 'driving'}

    const orig = (origin.address) ? origin.address : `${origin.logradouro}, ${origin.numero}, ${origin.localidade}, ${origin.cep}`
    const dest = (destination.address) ? destination.address : `${destination.logradouro}, ${destination.numero}, ${destination.localidade}, ${destination.cep}`
    const url = `https://www.google.com.br/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=${travelmode.mode}`
    
    await page.goto(url, { waitUntil: 'load' });
    
    const routes = await page.evaluate(() => {
        
        const tripElements = Array.from(document.querySelectorAll('div[id^="section-directions-trip"]'));

            const routes = tripElements.map((el) => {
            const container = el.querySelector('div > div');

            const titleEl       = container?.querySelector('div:nth-child(2) h1');
            const durationEl    = container?.querySelector('div > div > div:nth-child(1) > div:nth-child(1) > div');
            const distanceEl    = container?.querySelector('div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)');
            const noteEl        = container?.querySelector('div:nth-child(3) span span span:last-child');
            
            const travelModeSpan = el.querySelector('span[id^="section-directions-trip-travel-mode"] span[aria-label]');
            const travelMode     = travelModeSpan?.getAttribute('aria-label') ?? null;
            

            return {
                title: titleEl?.textContent?.trim() ?? null,
                duration: durationEl?.textContent?.trim() ?? null,
                distance: distanceEl?.textContent?.trim() ?? null,
                note: noteEl?.textContent?.trim() ?? null,
                travelMode: travelMode,
            };
        });    

         return routes;
    });
    
    // console.log("origin",origin)
    // console.log("destination",destination)
    // console.log("routes", routes);
    // console.log(url)
    // console.log(routes)
    
    return {
            origin,
            destination,
            routes
           }
  } catch (error) {
    console.log(error)
  } finally {
    puppeteer.closeBrowser()
  }
  
}

export {as_googleGeoLocation}