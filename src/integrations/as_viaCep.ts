import axios from "axios";
import { ViaCep } from "@root/interfaces";

async function as_viaCep(zipCode: string): Promise<ViaCep> {
    // Remove any hyphen for the request
    
    const url = `https://viacep.com.br/ws/${zipCode.replace("-", "")}/json/`;

    const response = await axios.get(url);
    const data  = response.data;
    // console.log('ViaCep: ',response)
    
    if (data.erro) {
        throw new Error(`Invalid ZIP code: ${zipCode}`);
    }

    // Build an address string from the returned data
    return data
}

export {as_viaCep}