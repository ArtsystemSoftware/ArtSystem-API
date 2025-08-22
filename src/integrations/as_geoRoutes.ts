import { ViaCep } from "@root/interfaces";
import { as_googleGeoLocation } from '@root/integrations';
import { as_viaCep } from "@root/integrations";

function as_isZipCode(input: string): boolean {
    return /^\d{5}-?\d{3}$/.test(input);
}

async function as_geoRoutes(address1: string, address2: string) {
    // If input is a ZIP code, convert it to a full address
    if (as_isZipCode(address1)) {
        const viacep: ViaCep = await as_viaCep(address1)
        // console.log(viacep)
        address1 = `${viacep.logradouro},  ${viacep.localidade} - ${viacep.uf}`;
    } 
    
    
    if (as_isZipCode(address2)) {
        const viacep: ViaCep = await as_viaCep(address2)
        address2 = `${viacep.logradouro}, ${viacep.localidade} - ${viacep.uf}`;
    }

    return await as_googleGeoLocation({address: address1}, {address: address2})
    
   
}

export { as_geoRoutes };
