export interface TokenBody {
    APICUIDAPI?: string | null; 
    APICCODCPF: string;
    APINID_USU: number;
    APICUSUNOM: string;
    APIC_SENHA: string;
    APICACCTKN: string;
    APICRFSTKN: string;
    APINEXPDAT: number; 
}

export interface ASPROPRO {
    PRONPAGNUM?: number;
    PRONPAGLIM?: number;
    PROCCDCEST: string;
    PROCCOD_EX: string;
    PROCCODNCM: string;
    PROCCODPRO: string;
    PROCDESCRI: string;
    PROCDESINT: string;
    PROCDESRES: string;
    PROCMARPRO: string;
    PROCUSUALT: string;
    PROCUSUCAD: string;
    PRODDATALT: string;
    PRODDATCAD: string;
    PRONALCOOL: number;
    PRONALTURA: number;
    PRONCLAPRO: number;
    PRONCOMPRI: number;
    PRONCTRSER: number;
    PRONEMIETI: number;
    PRONID_COM: number;
    PRONID_DEP: number;
    PRONID_EMB: number;
    PRONID_PRO: number;
    PRONID_PRT: number;
    PRONID_VAS: number;
    PRONLARGUR: number;
    PRONNAOVDA: number;
    PRONPERECI: number;
    PRONPESADO: number;
    PRONPESBRU: number;
    PRONPESLIQ: number;
    PRONPRETAB: number;
    PRONSELINM: number;
    PRONSUPVDA: number;
    PRONUMD_ID: number;
    PRONUMDFAT: number;
    PROXNAOVDA: string;
    PROCCONSUL: string | number;
    REFCCODREF?: string;
}
export interface ASPROEAN {
    EANNPAGNUM?: number;
    EANNPAGLIM?: number;
    EANNNAOVDA?: number;
    EANCCODEAN: string;
    EANCUSUALT: string;
    EANCUSUCAD: string;
    EANDDATALT: string;
    EANDDATCAD: string;
    EANNID_EAN: number;
    EANNID_PRO: number;
    EANNQTDEMB: number;
}

export interface ASPROASS {
    ASSNPAGNUM?: number;
    ASSNPAGLIM?: number;
    ASSCUSUALT: string;
    ASSCUSUCAD: string;
    ASSDDATALT: string;
    ASSDDATCAD: string;
    ASSNCUSACR: number;
    ASSNCUSAUT: number;
    ASSNCUSMUD: number;
    ASSNID_ASS: number;
    ASSNID_DES: number;
    ASSNID_PRI: number;
    ASSNID_PRO: number;
    ASSNMRGAUT: number;
    ASSNMRGMUD: number;
    ASSNQTDBXA: number;
    ASSNVDAACR: number;
    ASSNVDAAUT: number;
    ASSNVDAMUD: number;
}

export interface ASPROKIT {
    KITNPAGNUM?: number;
    KITNPAGLIM?: number;
    KITCTIPBXA: string;
    KITCTIPCAD: string;
    KITCUSUALT: string;
    KITCUSUCAD: string;
    KITDDATALT: string;
    KITDDATCAD: string;
    KITNCUSAUT: number;
    KITNID_KIT: number;
    KITNID_PRI: number;
    KITNID_PRO: number;
    KITNINGPRI: number;
    KITNPERPER: number;
    KITNPERPRO: number;
    KITNQTDREC: number;
    KITNQTDVDA: number;
    KITNVLRVDA: number;
}

export interface ASPROBAL {
    BALNPAGNUM?: number;
    BALNPAGLIM?: number;
    BALCCDCONS: string;
    BALCCDFRAC: string;
    BALCCDTARA: string;
    BALCCODFOR: string;
    BALCCODIMG: string;
    BALCCODNUT: string;
    BALCCODSOM: string;
    BALCEXTRA1: string;
    BALCEXTRA2: string;
    BALCRECEIT: string;
    BALCSETBAL: string;
    BALCTIPVAL: string;
    BALCUSUALT: string;
    BALCUSUCAD: string;
    BALDDATALT: string;
    BALDDATCAD: string;
    BALNDIAVAL: number;
    BALNID_BAL: number;
    BALNID_LOJ: number;
    BALNID_PRO: number;
    BALNMODETI: number;
    BALNTECBAL: number;
    BALNTIPTEC: number;
}

export interface ASPRONUT {
    NUTNPAGNUM?: number;
    NUTNPAGLIM?: number;
    NUTCCAMADI: string;
    NUTCDESCRI: string;
    NUTCUSUALT: string;
    NUTCUSUCAD: string;
    NUTDDATALT: string;
    NUTDDATCAD: string;
    NUTNALTACU: number;
    NUTNALTGOR: number;
    NUTNALTSOD: number;
    NUTNCALPOR: number;
    NUTNID_LOJ: number;
    NUTNID_NUT: number;
    NUTNID_PRO: number;
    NUTNMDCDEC: number;
    NUTNMDCINT: number;
    NUTNMDUTIL: number;
    NUTNPORCAC: number;
    NUTNPORCAL: number;
    NUTNPORCAR: number;
    NUTNPORFER: number;
    NUTNPORFIB: number;
    NUTNPORGSA: number;
    NUTNPORGTA: number;
    NUTNPORGTO: number;
    NUTNPORPRO: number;
    NUTNPORSOD: number;
    NUTNQTDPOR: number;
    NUTNQUANTI: number;
    NUTNUNIPOR: number;
    NUTNVLRACA: number;
    NUTNVLRACT: number;
    NUTNVLRCAC: number;
    NUTNVLRCAL: number;
    NUTNVLRCAR: number;
    NUTNVLRFER: number;
    NUTNVLRFIB: number;
    NUTNVLRGAL: number;
    NUTNVLRGSA: number;
    NUTNVLRGTA: number;
    NUTNVLRGTO: number;
    NUTNVLRLAC: number;
    NUTNVLRPRO: number;
    NUTNVLRSOD: number;
}
export interface ASPROINC {
    INCNPAGNUM?: number;
    INCNPAGLIM?: number;
    INCCCODCFO: string;
    INCCCODCRT: string;
    INCCCSTENT: string;
    INCCCSTSAI: string;
    INCCUSUALT: string;
    INCCUSUCAD: string;
    INCDDATALT: string;
    INCDDATCAD: string;
    INCNID_INC: number;
    INCNID_ING: number;
    INCNID_INT: number;
    INCNPERENT: number;
    INCNPERSAI: number;
}

export interface ASPROFIG {
    FIGNPAGNUM?: number;
    FIGNPAGLIM?: number;
    FIGC_CSOSN: string;
    FIGCCODCFO: string;
    FIGCCODCST: string;
    FIGCDESTIN: string;
    FIGCORIGEM: string;
    FIGCORITIP: string;
    FIGCSUBTIP: string;
    FIGCTIPCAD: string;
    FIGCTRITIP: string;
    FIGCUSUALT: string;
    FIGCUSUCAD: string;
    FIGDDATALT: string;
    FIGDDATCAD: string;
    FIGDMVAFIM: string;
    FIGDMVAINI: string;
    FIGNDESALI: number;
    FIGNFCPALI: number;
    FIGNICMCRE: number;
    FIGNICMDES: number;
    FIGNICMDSO: number;
    FIGNICMDST: number;
    FIGNID_ENT: number;
    FIGNID_FIG: number;
    FIGNID_MES: number;
    FIGNIDFIGU: number;
    FIGNSUBALI: number;
    FIGNSUBARE: number;
    FIGNSUBEXT: number;
    FIGNSUBMVA: number;
    FIGNSUBRED: number;
    FIGNTIPCFO: number;
    FIGNTRIALI: number;
    FIGNTRIREC: number;
    FIGNTRIRED: number;
}

export interface ASPRODEP {
    DEPNPAGNUM?: number;
    DEPNPAGLIM?: number;
    DEPCDESCRI: string;
    DEPCUSUALT: string;
    DEPCUSUCAD: string;
    DEPDDATALT: string;
    DEPDDATCAD: string;
    DEPNID_DEP: number;
    DEPNID_PAI: number;
    DEPNVDAMRG: number;
}

export interface ASPROREF {
    REFNPAGNUM?: number;
    REFNPAGLIM?: number;
    REFNNAOVDA?: number;
    REFCCODREF: string;
    REFCUSUALT: string;
    REFCUSUCAD: string;
    REFDDATALT: string;
    REFDDATCAD: string;
    REFNFNCPRI: number;
    REFNID_EMB: number;
    REFNID_FIG: number;
    REFNID_FNC: number;
    REFNID_FND: number;
    REFNID_PRO: number;
    REFNID_REF: number;
    REFNQTDEMB: number;
    REFNTIPFOR: number;
    REFNXMLEMB: number;
}

export interface ASPROPRE {
    PRENPAGNUM?: number;
    PRENPAGLIM?: number;
    USUNID_ENT?: number;
    PRECCODCFO: string;
    PRECCUSORI: string;
    PRECDESCOM: string;
    PRECTIPBON: string;
    PRECTIPCST: string;
    PRECTIPDAC: string;
    PRECTIPDES: string;
    PRECTIPENC: string;
    PRECTIPFRE: string;
    PRECTIPIPI: string;
    PRECTIPOUI: string;
    PRECUSUALT: string;
    PRECUSUCAD: string;
    PRECUSUEXC: string;
    PRECVDAORI: string;
    PREDCUSDAT: string;
    PREDDATALT: string;
    PREDDATCAD: string;
    PREDDATEXC: string;
    PREDDATLIN: string;
    PREDULT_NF: string;
    PREDVDADAT: string;
    PREDVDAVIG: string;
    PRELEMIETI: string;
    PRELVDAGER: string;
    PRENCSIGER: number;
    PRENCUSCSI: number;
    PRENCUSDIG: number;
    PRENCUSEMB: number;
    PRENCUSFIX: number;
    PRENCUSMED: number;
    PRENCUSREP: number;
    PRENID_FNC: number;
    PRENID_INC: number;
    PRENID_LOJ: number;
    PRENID_OFE: number;
    PRENID_PRE: number;
    PRENID_PRO: number;
    PRENIDFIGU: number;
    PRENMRGMIN: number;
    PRENOFEGER: number;
    PRENOFELIQ: number;
    PRENOFEMRE: number;
    PRENPROLIN: number;
    PRENREPGER: number;
    PRENVDAATU: number;
    PRENVDACAR: number;
    PRENVDAGER: number;
    PRENVDALIQ: number;
    PRENVDAMRE: number;
    PRENVDAMRG: number;
    PRENVDAPMZ: number;
    PRENVDASUG: number;
    PRENVLRBON: number;
    PRENVLRDAC: number;
    PRENVLRDES: number;
    PRENVLRENC: number;
    PRENVLRFRE: number;
    PRENVLRIPI: number;
    PRENVLROUI: number;
    PRENVLRPAU: number;
}

export interface ASPROTAB {
    PTPNPAGNUM?: number;
    PTPNPAGLIM?: number;
    PTPCUSUALT: string;
    PTPCUSUCAD: string;
    PTPDDATALT: string;
    PTPDDATCAD: string;
    PTPNID_PRO: number;
    PTPNID_PTP: number;
    PTPNVDAATU: number;
    PTPNVDAMRE: number;
    PTPNVDAMRG: number;
    PTPNVDASUG: number;
}

export interface ASPROEST {
    ESTNPAGNUM?: number;
    ESTNPAGLIM?: number;
    ESTCUSUALT: string;
    ESTCUSUCAD: string;
    ESTDDATALT: string;
    ESTDDATCAD: string;
    ESTDDATVAL: string;
    ESTDULT_NF: string;
    ESTDULTINV: string;
    ESTDULTMOV: string;
    ESTNESTATU: number;
    ESTNESTAVA: number;
    ESTNESTDEP: number;
    ESTNESTLOJ: number;
    ESTNESTMAX: number;
    ESTNESTMIN: number;
    ESTNID_EST: number;
    ESTNID_LOJ: number;
    ESTNID_PRO: number;
}

export interface ASPROEST_AVA {
    AVANPAGNUM?: number;
    AVANPAGLIM?: number;
    AVACOBSERV: string;
    AVACTIPAVA: string;
    AVACUSUCAD: string;
    AVADDATCAD: string;
    AVANAVAANT: number;
    AVANAVAPOS: number;
    AVANID_AVA: number;
    AVANID_LOJ: number;
    AVANID_MOT: number;
    AVANID_PRO: number;
    AVANQTDAVA: number;
}

export interface ASPEDCAB {
    CABNPAGNUM?: number;
    CABNPAGLIM?: number;
    CABC_PLACA: string;
    CABCCONPAG: string;
    CABCDI_DSB: string;
    CABCDI_DUF: string;
    CABCDI_NUM: string;
    CABCENTPED: string;
    CABCNOMRES: string;
    CABCOBSERV: string;
    CABCPEDSTA: string;
    CABCTIPDAC: string;
    CABCTIPDES: string;
    CABCTIPENC: string;
    CABCTIPENT: string;
    CABCTIPFRE: string;
    CABCTIPPED: string;
    CABCUSUALT: string;
    CABCUSUCAD: string;
    CABCVOLESP: string;
    CABD_NFEMI: string;
    CABDDATALT: string;
    CABDDATCAD: string;
    CABDDI_DDI: string;
    CABDDI_DSB: string;
    CABDPRAENT: string;
    CABDPROENT: string;
    CABN_NFNUM: number;
    CABNID_CAB: number;
    CABNID_CAR: number;
    CABNID_COB: number;
    CABNID_ENT: number;
    CABNID_ETR: number;
    CABNID_LOJ: number;
    CABNID_PGE: number;
    CABNID_PTP: number;
    CABNID_TRA: number;
    CABNID_VEN: number;
    CABNMODFRE: number;
    CABNPESBRU: number;
    CABNPESLIQ: number;
    CABNVLRCOM: number;
    CABNVLRDAC: number;
    CABNVLRDES: number;
    CABNVLRENC: number;
    CABNVLRFRE: number;
    CABNVOLQTD: number;
}

export interface ASPEDCAB_REF {
    CARNPAGNUM?: number;
    CARNPAGLIM?: number;
    CARC_NFCHA: string;
    CARCTIP_NF: string;
    CARCUSUALT: string;
    CARCUSUCAD: string;
    CARDDATALT: string;
    CARDDATCAD: string;
    CARDDATEMI: string;
    CARNID_CAB: number;
    CARNID_CAR: number;
}

export interface ASPEDCAB_PLG {
    PLGNPAGNUM?: number;
    PLGNPAGLIM?: number;
    PLGCID_PLG: string;
    PLGCPLGETI: string;
    PLGCPLGSTA: string;
    PLGCUSUALT: string;
    PLGCUSUCAD: string;
    PLGDDATALT: string;
    PLGDDATCAD: string;
    PLGNID_CAB: number;
    PLGNID_PLG: number;
}

export interface ASPEDCOMAN {
    PCMNPAGNUM?: number;
    PCMNPAGLIM?: number;
    PCMCPROOBS: string;
    PCMCUSUALT: string;
    PCMCUSUCAD: string;
    PCMDDATALT: string;
    PCMDDATCAD: string;
    PCMDGERLST: string;
    PCMNID_AUT: number;
    PCMNID_LCM: number;
    PCMNID_LMS: number;
    PCMNID_LOJ: number;
    PCMNID_OPE: number;
    PCMNID_PCM: number;
    PCMNID_PED: number;
    PCMNID_PRO: number;
    PCMNNUMCUP: number;
    PCMNNUMPDV: number;
    PCMNPROIMP: number;
    PCMNQUANTI: number;
    PCMNSTATUS: number;
    PCMNVLRUNI: number;
}

export interface ASPEDCAB_COM {
    CBCNPAGNUM?: number;
    CBCNPAGLIM?: number;
    CBCCCOMSTA: string;
    CBCCCOMTIP: string;
    CBCCTIPENT: string;
    CBCCUSUALT: string;
    CBCCUSUCAD: string;
    CBCDDATALT: string;
    CBCDDATCAD: string;
    CBCNCOMBAS: number;
    CBCNCOMTOT: number;
    CBCNCOMVLR: number;
    CBCNID_CAB: number;
    CBCNID_CBC: number;
    CBCNID_ENT: number;
    CBCNID_FIN: number;
    CBCNID_ITE: number;
}

export interface ASPEDCAB_FIN {
    CAFNPAGNUM?: number;
    CAFNPAGLIM?: number;
    CAFCCDCMC7: string;
    CAFCUSUALT: string;
    CAFCUSUCAD: string;
    CAFDDATALT: string;
    CAFDDATCAD: string;
    CAFDVENCTO: string;
    CAFNID_BAN: number;
    CAFNID_CAB: number;
    CAFNID_CAF: number;
    CAFNID_FIN: number;
    CAFNIDBANC: number;
    CAFNVLRFIN: number;
    CAFNVLRTRO: number;
}

export interface ASPEDCAB_OBS {
    COBNPAGNUM?: number;
    COBNPAGLIM?: number;
    COBCOBSERV: string;
    COBCTIPOBS: string;
    COBCUSUALT: string;
    COBCUSUCAD: string;
    COBDDATALT: string;
    COBDDATCAD: string;
    COBNID_CAB: number;
    COBNID_COB: number;
}

export interface ASPEDCAB_OS {
    COSNPAGNUM?: number;
    COSNPAGLIM?: number;
    COSCCHKLIS: string;
    COSCCONPAG: string;
    COSCOBSDEF: string;
    COSCOBSINT: string;
    COSCSTA_OS: string;
    COSCSTAPAG: string;
    COSCUSUALT: string;
    COSCUSUCAD: string;
    COSDDATALT: string;
    COSDDATCAD: string;
    COSDPROENT: string;
    COSNID_CEL: number;
    COSNID_CLI: number;
    COSNID_COS: number;
    COSNID_LOJ: number;
    COSNID_VEN: number;
    COSNVLRCOM: number;
}

export interface ASPEDCAB_OS_ITE {
    IOSNPAGNUM?: number;
    IOSNPAGLIM?: number;
    IOSCOBSPRO: string;
    IOSCTIPDES: string;
    IOSCTIPPRO: string;
    IOSCUSUALT: string;
    IOSCUSUCAD: string;
    IOSDDATALT: string;
    IOSDDATCAD: string;
    IOSNID_COS: number;
    IOSNID_IOS: number;
    IOSNID_PRO: number;
    IOSNQUANTI: number;
    IOSNTOTDES: number;
    IOSNVLRDES: number;
    IOSNVLRUNI: number;
}

export interface ASPEDITE {
    ITENPAGNUM?: number;
    ITENPAGLIM?: number;
    ITECCFONOT: string;
    ITECCODCST: string;
    ITECCSTCOF: string;
    ITECCSTPIS: string;
    ITECDADFIG: string;
    ITECDESCOM: string;
    ITECNUMSER: string;
    ITECTIPBON: string;
    ITECTIPDAC: string;
    ITECTIPDES: string;
    ITECTIPENC: string;
    ITECTIPFRE: string;
    ITECTIPIPI: string;
    ITECTIPOUI: string;
    ITECTRITIP: string;
    ITECUSUALT: string;
    ITECUSUCAD: string;
    ITECXMLCAM: string;
    ITEDDATALT: string;
    ITEDDATCAD: string;
    ITEDDATVAL: string;
    ITENBASPCO: number;
    ITENBCSTRE: number;
    ITENDESALI: number;
    ITENDESPAR: number;
    ITENDESVLR: number;
    ITENDI_PAD: number;
    ITENDI_PII: number;
    ITENDI_PIP: number;
    ITENDI_VAD: number;
    ITENDI_VCO: number;
    ITENDI_VII: number;
    ITENDI_VPI: number;
    ITENFCPALI: number;
    ITENFCPBAS: number;
    ITENFECVLR: number;
    ITENICMAPR: number;
    ITENICMBAS: number;
    ITENICMDES: number;
    ITENICMDSO: number;
    ITENICMEXC: number;
    ITENICMVAP: number;
    ITENICMVLR: number;
    ITENID_CAB: number;
    ITENID_EMB: number;
    ITENID_INC: number;
    ITENID_ITE: number;
    ITENID_PRI: number;
    ITENID_PRO: number;
    ITENIDFIGU: number;
    ITENISEVLR: number;
    ITENORIVLR: number;
    ITENPERCOF: number;
    ITENPERPIS: number;
    ITENPESTRE: number;
    ITENQTDEMB: number;
    ITENQTDSOB: number;
    ITENQUANTI: number;
    ITENRETIRA: number;
    ITENSFRBAS: number;
    ITENSFRVLR: number;
    ITENST_BAS: number;
    ITENST_VLR: number;
    ITENSTEBAS: number;
    ITENSTEVLR: number;
    ITENTOTBON: number;
    ITENTOTDAC: number;
    ITENTOTDES: number;
    ITENTOTENC: number;
    ITENTOTFRE: number;
    ITENTOTIPI: number;
    ITENTOTOUI: number;
    ITENTRIALI: number;
    ITENTRIRED: number;
    ITENVLRBON: number;
    ITENVLRDAC: number;
    ITENVLRDES: number;
    ITENVLRENC: number;
    ITENVLRFRE: number;
    ITENVLRIPI: number;
    ITENVLROUI: number;
    ITENVLRPAU: number;
    ITENVLRTAB: number;
    ITENVLRUNI: number;
    ITENVLSTRE: number;
}

export interface ASPEDITE_OBS {
    IOBNPAGNUM?: number;
    IOBNPAGLIM?: number;
    IOBCOBSERV: string;
    IOBCTIPOBS: string;
    IOBCUSUALT: string;
    IOBCUSUCAD: string;
    IOBDDATALT: string;
    IOBDDATCAD: string;
    IOBNID_IOB: number;
    IOBNID_ITE: number;
}

export interface ASPEDITE_AMB {
    IAMNPAGNUM?: number;
    IAMNPAGLIM?: number;
    IAMCOBSERV: string;
    IAMCUSUALT: string;
    IAMCUSUCAD: string;
    IAMDDATALT: string;
    IAMDDATCAD: string;
    IAMNID_AMB: number;
    IAMNID_CAB: number;
    IAMNID_IAM: number;
    IAMNID_PRO: number;
    IAMNQUANTI: number;
    IAMNRETIRA: number;
    IAMNVLRUNI: number;
}

export interface ASPEDITE_ASS {
    ITANPAGNUM?: number;
    ITANPAGLIM?: number;
    ITACUSUALT: string;
    ITACUSUCAD: string;
    ITADDATALT: string;
    ITADDATCAD: string;
    ITADVDAVIG: string;
    ITANCUSCSI: number;
    ITANCUSFIX: number;
    ITANCUSREP: number;
    ITANID_ITA: number;
    ITANID_ITE: number;
    ITANTIPFOR: number;
    ITANVDAATU: number;
    ITANVDALIQ: number;
    ITANVDAMRE: number;
    ITANVDAMRG: number;
    ITANVDASUG: number;
}

export interface ASPEDITE_DIS {
    ITDNPAGNUM?: number;
    ITDNPAGLIM?: number;
    ITDCUSUALT: string;
    ITDCUSUCAD: string;
    ITDDDATALT: string;
    ITDDDATCAD: string;
    ITDNID_ITD: number;
    ITDNID_ITE: number;
    ITDNID_LOJ: number;
    ITDNQUANTI: number;
}

export interface ASPEDITE_DIS_BXA {
    ITBNPAGNUM?: number;
    ITBNPAGLIM?: number;
    ITBC_NFESP: string;
    ITBC_NFSER: string;
    ITBCDESCRI: string;
    ITBCUSUALT: string;
    ITBCUSUCAD: string;
    ITBDDATALT: string;
    ITBDDATCAD: string;
    ITBN_BAIXA: number;
    ITBN_NFNUM: number;
    ITBNID_CAB: number;
    ITBNID_CRI: number;
    ITBNID_ITB: number;
    ITBNID_ITE: number;
    ITBNID_LOJ: number;
}

export interface ASPEDITE_ENT {
    IENNPAGNUM?: number;
    IENNPAGLIM?: number;
    IENCOBSERV: string;
    IENCUSUALT: string;
    IENCUSUCAD: string;
    IENDDATALT: string;
    IENDDATCAD: string;
    IENDDATENT: string;
    IENDDATENV: string;
    IENDDATSEP: string;
    IENNID_CAB: number;
    IENNID_IEN: number;
    IENNSTATUS: number;
}

export interface ASPEDITE_ENT_ITE {
    IETNPAGNUM?: number;
    IETNPAGLIM?: number;
    IETCUSUALT: string;
    IETCUSUCAD: string;
    IETDDATALT: string;
    IETDDATCAD: string;
    IETNID_IEN: number;
    IETNID_IET: number;
    IETNID_PRI: number;
    IETNID_PRO: number;
    IETNQT_SEP: number;
}

export interface ASCADGER {
    GERNPAGNUM?: number;
    GERNPAGLIM?: number;
    GERCCAM001: string;
    GERCDESCRI: string;
    GERCTIPCAD: string;
    GERCUSUALT: string;
    GERCUSUCAD: string;
    GERDDATALT: string;
    GERDDATCAD: string;
    GERNID_GER: number;
}

export interface ASENTENT {
    ENTNPAGNUM?: number;
    ENTNPAGLIM?: number;
    ENTCAPELID: string;
    ENTCCOD_RG: string;
    ENTCCODCPF: string;
    ENTCE_MAIL: string;
    ENTCENDCOM: string;
    ENTCNOMENT: string;
    ENTCTIPPES: string;
    ENTCUSUALT: string;
    ENTCUSUCAD: string;
    ENTDDATALT: string;
    ENTDDATCAD: string;
    ENTNENDNUM: number;
    ENTNID_CEP: number;
    ENTNID_ENT: number;
}

export interface ASENTTRA {
    TRANPAGLIM?: number;
    TRANPAGNUM?: number;
    TRACCODAGE: string;
    TRACCODBAN: string;
    TRACCODFIS: string;
    TRACCONTAT: string;
    TRACNUMCON: string;
    TRACUSUALT: string;
    TRACUSUCAD: string;
    TRADDATALT: string;
    TRADDATCAD: string;
    TRANDELIVE: number;
    TRANFREEMI: number;
    TRANID_ENT: number;
}

export interface ASENTMOT {
    MOTNPAGLIM?: number;
    MOTNPAGNUM?: number;
    MOTCCODCNH: string;
    MOTCTIPCNH: string;
    MOTCUSUALT: string;
    MOTCUSUCAD: string;
    MOTDDATALT: string;
    MOTDDATCAD: string;
    MOTDVALCNH: string;
    MOTNID_ENT: number;
}

export interface ASENTVEN {
    VENNPAGLIM?: number;
    VENNPAGNUM?: number;
    VENCUSUALT: string;
    VENCUSUCAD: string;
    VENDDATALT: string;
    VENDDATCAD: string;
    VENN_ATIVO: number;
    VENNID_ENT: number;
    VENNLIMDES: number;
    VENNSTATUS: number;
    VENNVLRCOM: number;
}

export interface ASENTVEN_PRO {
    VEPNPAGLIM?: number;
    VEPNPAGNUM?: number;
    VEPCTIPVLR: string;
    VEPCUSUALT: string;
    VEPCUSUCAD: string;
    VEPDDATALT: string;
    VEPDDATCAD: string;
    VEPNID_CNC: number;
    VEPNID_PRO: number;
    VEPNID_VEN: number;
    VEPNID_VEP: number;
    VEPNVLRCOM: number;
}

export interface ASENTDIV {
    DIVNPAGLIM?: number;
    DIVNPAGNUM?: number;
    DIVCCAM001: string;
    DIVCTIPCAD: string;
    DIVCUSUALT: string;
    DIVCUSUCAD: string;
    DIVDDATALT: string;
    DIVDDATCAD: string;
    DIVNID_DIV: number;
    DIVNID_ENT: number;
}

export interface ASENTDIV_PRO {
    DIPNPAGLIM?: number;
    DIPNPAGNUM?: number;
    DIPCTIPCAD: string;
    DIPCTIPVLR: string;
    DIPCUSUALT: string;
    DIPCUSUCAD: string;
    DIPDDATALT: string;
    DIPDDATCAD: string;
    DIPNID_CNC: number;
    DIPNID_DIP: number;
    DIPNID_DIV: number;
    DIPNID_PRO: number;
    DIPNVLRCOM: number;
}

export interface ASENTEDR {
    EDRNPAGLIM?: number;
    EDRNPAGNUM?: number;
    EDRCEDRCOM: string;
    EDRCSTATUS: string;
    EDRCTIPEDR: string;
    EDRCTIPENT: string;
    EDRCUSUALT: string;
    EDRCUSUCAD: string;
    EDRDDATALT: string;
    EDRDDATCAD: string;
    EDRNEDRNUM: number;
    EDRNID_CEP: number;
    EDRNID_EDR: number;
    EDRNID_ENT: number;
}

export interface ASCEPCEP {
    CEPNPAGNUM?: number;
    CEPNPAGLIM?: number;
    CEPCCODCEP: string;
    CEPCDESCRI: string;
    CEPCUSUALT: string;
    CEPCUSUCAD: string;
    CEPDDATALT: string;
    CEPDDATCAD: string;
    CEPNID_BAI: number;
    CEPNID_CEP: number;
    CEPNID_LOG: number;
}

export interface ASCEPBAI {
    BAINPAGNUM?: number;
    BAINPAGLIM?: number;
    BAICDESCRI: string;
    BAICUSUALT: string;
    BAICUSUCAD: string;
    BAIDDATALT: string;
    BAIDDATCAD: string;
    BAINID_BAI: number;
    BAINID_MUN: number;
}

export interface ASCEPMUN {
    MUNNPAGNUM?: number;
    MUNNPAGLIM?: number;
    MUNCCOD_UF: string;
    MUNCCODIBG: string;
    MUNCDESCRI: string;
    MUNCUSUALT: string;
    MUNCUSUCAD: string;
    MUNDDATALT: string;
    MUNDDATCAD: string;
    MUNNID_MUN: number;
}

export interface ASENTTEL {
    TELNPAGNUM?: number;
    TELNPAGLIM?: number;
    TELCUSUALT: string;
    TELCUSUCAD: string;
    TELDDATALT: string;
    TELDDATCAD: string;
    TELMOBSERV: string;
    TELNCODDDD: number;
    TELNID_ENT: number;
    TELNID_TEL: number;
    TELNNUMTEL: number;
}

export interface ASENTCOM {
    COMNPAGLIM?: number;
    COMNPAGNUM?: number;
    COMCUSUALT: string;
    COMCUSUCAD: string;
    COMDDATALT: string;
    COMDDATCAD: string;
    COMNID_ENT: number;
    COMNSTATUS: number;
}

export interface ASENTLOJ {
    LOJNPAGLIM?: number;
    LOJNPAGNUM?: number;
    LOJC_NFESP: string;
    LOJC_NFSER: string;
    LOJCBALTIP: string;
    LOJCBALTRA: string;
    LOJCCERSEN: string;
    LOJCCERTIP: string;
    LOJCCODCRT: string;
    LOJCCODLOJ: string;
    LOJCEMLASU: string;
    LOJCEMLEND: string;
    LOJCEMLMEN: string;
    LOJCEMLPOR: string;
    LOJCEMLSEN: string;
    LOJCEMLSMT: string;
    LOJCETIPRE: string;
    LOJCLICART: string;
    LOJCLICFLX: string;
    LOJCNFEENV: string;
    LOJCNFEIMP: string;
    LOJCPDVBKL: string;
    LOJCPDVBKP: string;
    LOJCPDVCON: string;
    LOJCPDVLOG: string;
    LOJCPDVREC: string;
    LOJCPDVTRA: string;
    LOJCTCPTRA: string;
    LOJCTIPLOJ: string;
    LOJCUSUALT: string;
    LOJCUSUCAD: string;
    LOJCUSUFEC: string;
    LOJDDATALT: string;
    LOJDDATCAD: string;
    LOJDULTFEC: string;
    LOJDULTGER: string;
    LOJLEMLCCO: string;
    LOJLEMLSSL: string;
    LOJLIMPDAN: string;
    LOJLSENAUT: string;
    LOJN_NFNUM: number;
    LOJNBALCOD: number;
    LOJNBALDES: number;
    LOJNBALETI: number;
    LOJNBALMOD: number;
    LOJNBALPLU: number;
    LOJNCIEAUT: number;
    LOJNCREDSN: number;
    LOJNID_CON: number;
    LOJNID_ENT: number;
    LOJNID_EST: number;
    LOJNNUMCOP: number;
    LOJNPDVMOD: number;
    LOJNTCPMOD: number;
    LOJNTIPAMB: number;
}

export interface ASENTCLI {
    CLINPAGLIM?: number;
    CLINPAGNUM?: number;
    CLINID_ENT: number;		CLICSERASA: string;		CLINID_CVN: number;		CLINID_PTP: number;		CLIDDATALT: string;
    CLINID_STA: number;		CLIDSERCON: string;		CLICCVNCHA: string;		CLINPERDES: number;     
    CLINID_ATI: number;		CLICSERRES: string;		CLINID_STV: number;		CLINPERACR: number;		
    CLINID_VEN: number;		CLINID_COB: number;		CLINID_FIN: number;		CLINFINDES: number;		
    CLICSEXTIP: string;		CLINCOBNUM: number;		CLINCVNSAL: number;		CLINID_PFI: number;		
    CLIDNASABE: string;		CLICCOBCOM: string;		CLINCVNLIM: number;		CLINQTDDIA: number;		
    CLICCONPAG: string;		CLINID_ETR: number;		CLINCVNDES: number;		CLINID_BAC: number;		
    CLINLIMCHE: number;		CLINETRNUM: number;		CLINCVNSEN: number;		CLICUSUCAD: string;		
    CLINLIMCPR: number;		CLICETRCOM: string;		CLINID_TRA: number;		CLIDDATCAD: string;		
    CLINLIMAMI: number;		CLICETRREF: string;		CLINLIMPED: number;		CLICUSUALT: string;		
}

export interface ASENTCLI_CAR {
    CARNPAGLIM?: number;
    CARNPAGNUM?: number;
    CARCCHASSI: string;
    CARCMARCAR: string;
    CARCMODCAR: string;
    CARCPLACAR: string;
    CARCUSUALT: string;
    CARCUSUCAD: string;
    CARDDATALT: string;
    CARDDATCAD: string;
    CARNANOCAR: number;
    CARNID_CAR: number;
    CARNID_CLI: number;
    CARNMODCAR: number;
}

export interface ASENTCLI_PRO {
    CLPNPAGLIM?: number;
    CLPNPAGNUM?: number;
    CLPCFXATIP: string;
    CLPCTIPVLR: string;
    CLPCUSUALT: string;
    CLPCUSUCAD: string;
    CLPDDATALT: string;
    CLPDDATCAD: string;
    CLPNFXATET: number;
    CLPNFXAVLR: number;
    CLPNID_CLI: number;
    CLPNID_CLP: number;
    CLPNID_CNC: number;
    CLPNID_PRO: number;
    CLPNVLRCOM: number;
}

export interface ASENTFNC {
    FNCNPAGLIM?: number;
    FNCNPAGNUM?: number;
    FNCCCODAGE: string;
    FNCCCODBAN: string;
    FNCCCODCPF: string;
    FNCCCODFIS: string;
    FNCCCONPAG: string;
    FNCCCONTAT: string;
    FNCCEMLVEN: string;
    FNCCNUMCON: string;
    FNCCUSUALT: string;
    FNCCUSUCAD: string;
    FNCDDATALT: string;
    FNCDDATCAD: string;
    FNCDDTNASC: string;
    FNCNALTPRE: number;
    FNCNBASDAC: number;
    FNCNBASDAR: number;
    FNCNBASDES: number;
    FNCNBASENC: number;
    FNCNBASFRE: number;
    FNCNBASIPI: number;
    FNCNBONEMB: number;
    FNCNCOBCEP: number;
    FNCNCOBCOM: number;
    FNCNCOBNUM: number;
    FNCNDESFIN: number;
    FNCNDESLOG: number;
    FNCNFRERED: number;
    FNCNICMDSO: number;
    FNCNID_CCU: number;
    FNCNID_ENT: number;
    FNCNID_PFI: number;
    FNCNIPIBRU: number;
    FNCNIPIENC: number;
    FNCNIPIFRE: number;
    FNCNPERCOM: number;
    FNCNREGFOR: number;
    FNCNSCPPRZ: number;
    FNCNSCPVIS: number;
    FNCNSTATUS: number;
    FNCNSUBDAC: number;
    FNCNSUBDES: number;
    FNCNSUBENC: number;
    FNCNSUBFRE: number;
    FNCNSUBIPI: number;
    FNCNSUFDES: number;
    FNCNTIPAVA: number;
    FNCNTIPFOR: number;
    FNCNTRUICM: number;
}

export interface ASENTCEN_COM {
    CNCNPAGLIM?: number;
    CNCNPAGNUM?: number;
    CNCCTIPENT: string;
    CNCCUSUALT: string;
    CNCCUSUCAD: string;
    CNCDDATALT: string;
    CNCDDATCAD: string;
    CNCNID_CNC: number;
    CNCNID_ENT: number;
}

export interface ASENTCEN_CLI {
    CCLNPAGLIM?: number;
    CCLNPAGNUM?: number;
    CCLCUSUALT: string;
    CCLCUSUCAD: string;
    CCLDDATALT: string;
    CCLDDATCAD: string;
    CCLNID_CCL: number;
    CCLNID_CLI: number;
    CCLNID_CNC: number;
}

export interface ASCADMEN {
    MENNPAGNUM?: number;
    MENNPAGLIM?: number;
    MENCCOMAND: string;
    MENCDESCRI: string;
    MENCORDMEN: string;
    MENCUSUALT: string;
    MENCUSUCAD: string;
    MENCUSULIB: string;
    MENDDATALT: string;
    MENDDATCAD: string;
    MENNID_MEN: number;
    MENNID_PAI: number;

}

export interface ASENTUSU_MEN {
    MENNPAGNUM?: number;
    MENNPAGLIM?: number;
    MENNID_USU: number;
    MENCDESCRI: string;
    MENCORDMEN: string;
    MENCUSULIB: string;
    MENNID_MEN: number;
    MENNID_PAI: number;

}

export interface ASFINFIN_DET {
    FINNID_LOJ: number; 
    FINCCODLOJ: string;
    FINCAPELID: string; 
    FINCNOMENT: string;
    FINNVLRVDA: number;
    FINN_TIKET: number;
    FINDDATINI: string;
    FINDDATFIN: string;
    PAGNVALBRU: number;
    PAGNVALLIQ: number;
    RECNVALBRU: number;
    RECNVALLIQ: number;

} 

export interface ASPROMOV_RAN {
    LOJNID_ENT: number;
    LOJCCODLOJ: string;
    LOJCAPELID: string;
    PROCCODPRO: string;
    PROCDESCRI: string;
    MVPNQTDMOV: number;
    MVPNRANKIN: number;
    MVPDDATINI: string;
    MVPDDATFIN: string;
    MVPNVLRVDA: number;
}

export interface ASENTUSU_LOJ {
    USLNID_USL: number;
    USLNID_USU: number;
    USLNID_LOJ: number;
    USLNLOJPRI: number;
    USLDDATALT: string;
    USLDDATCAD: string;
    USLCUSUALT: string;
    USLCUSUCAD: string;
}

export interface ASPGEPGE {
    PGENPAGNUM?: number;
    PGENPAGLIM?: number;
    PGECDESCRI: string;
    PGECNOMREP: string;
    PGECTIPEND: string;
    PGECTIPENT: string;
    PGECTIPPGE: string;
    PGECUSUALT: string;
    PGECUSUCAD: string;
    PGEDDATALT: string;
    PGEDDATCAD: string;
    PGENALTCPG: number;
    PGENALTCUS: number;
    PGENALTREF: number;
    PGENALTXML: number;
    PGENATUCMD: number;
    PGENATUCUS: number;
    PGENATUEST: number;
    PGENATUFIN: number;
    PGENATUIOR: number;
    PGENATUMRG: number;
    PGENATUVDA: number;
    PGENBALCNF: number;
    PGENBXAFEC: number;
    PGENCLILIM: number;
    PGENCOMDES: number;
    PGENCOMDEV: number;
    PGENCRITAB: number;
    PGENDESCLI: number;
    PGENDIGAMB: number;
    PGENDIGEMB: number;
    PGENDIGFIN: number;
    PGENDIGPRO: number;
    PGENDIGVEN: number;
    PGENEMI_NF: number;
    PGENEMIBOL: number;
    PGENENDENT: number;
    PGENENTAUT: number;
    PGENFECITE: number;
    PGENFNCPRI: number;
    PGENGERFIS: number;
    PGENGERLST: number;
    PGENID_BAC: number;
    PGENID_CCU: number;
    PGENID_MPR: number;
    PGENID_PFI: number;
    PGENID_PGE: number;
    PGENIMPAJU: number;
    PGENIMPDIR: number;
    PGENINCLIS: number;
    PGENINCPRO: number;
    PGENINCTEL: number;
    PGENITESOB: number;
    PGENITEVAL: number;
    PGENMANIFE: number;
    PGENMODDIG: number;
    PGENNAOCAD: number;
    PGENPEDITE: number;
    PGENPESVEI: number;
    PGENPLACAR: number;
    PGENPROOBS: number;
    PGENSEPPED: number;
    PGENSUGEMB: number;
    PGENSUPLIB: number;
    PGENTITATR: number;
    PGENTRAVDA: number;
    PGENUTICNF: number;
    PGENUTICUS: number;
    PGENVERCOM: number;
    PGENVEREST: number;
    PGENVLRTOL: number;
}

export interface ASPGECFO {
    PCFNPAGNUM?: number;
    PCFNPAGLIM?: number;
    PCFCCFODES: string;
    PCFCCFOENT: string;
    PCFCUSUALT: string;
    PCFCUSUCAD: string;
    PCFDDATALT: string;
    PCFDDATCAD: string;
    PCFNID_PCF: number;
    PCFNID_PGE: number;
}

export interface ASAPIPRO_IMG {
    PIMNPAGNUM?: number;
    PIMNPAGLIM?: number;
    PIMCUIDPIM?: string;	
    PIMCCODEAN: string;	
    PIMCURLIMG: string | null;	
    PIMCORIGEM: string;	
    PIMDDATCAD?: string;
}

export interface ASGOOGLE_KEY {
    GOGCUIDGOG: string;
    GOGCCODKEY: string;
    GOGCCOD_CX: string;
    GOGDDATEXP: string;
    GOGDDATCAD: string;
}

export interface ASENTAPI {
    APTNPAGNUM?: number;
    APTNPAGLIM?: number;
    APTCUIDAPT: string;
    APTCUIDENT: string;
    APTNID_ENT: number;
    APTC_TOKEN: string;
    APTCCODCPF: string;
    APTCSERVER: string;
    APTCINSTAN: string;
    APTN_PORTA: number;
    APTCUSUCAD: string;
    APTDDATCAD: string;
    APTCUSUALT: string;
    APTDDATALT: string;
}

export interface ViaCep {
     cep:           string;
     logradouro:    string;
     complemento:   string;
     unidade:       string;
     bairro:        string;
     localidade:    string;
     uf:            string;
     estado:        string;
     regiao:        string;
     ibge:          string;
     gia:           string;
     ddd:           string;
     siafi:         string;
     numero?:       number;
}

export interface ASTESFIN {
    TSFNPAGNUM?: number;
    TSFNPAGLIM?: number;
    TSFCTIPCAL: string;
    TSFCTIPINC: string;
    TSFCTIPJUR: string;
    TSFCUSUALT: string;
    TSFCUSUCAD: string;
    TSFDDATALT: string;
    TSFDDATCAD: string;
    TSFNACITEF: number;
    TSFNATIAPK: number;
    TSFNATIPDV: number;
    TSFNBLOFUN: number;
    TSFNCHEDSJ: number;
    TSFNCHEJME: number;
    TSFNCHEMAX: number;
    TSFNEMIREC: number;
    TSFNID_BAC: number;
    TSFNID_CCU: number;
    TSFNID_FIN: number;
    TSFNID_FNC: number;
    TSFNID_LOJ: number;
    TSFNID_MPR: number;
    TSFNID_PDV: number;
    TSFNID_PFI: number;
    TSFNID_PTX: number;
    TSFNID_TAX: number;
    TSFNID_TSF: number;
    TSFNLIMDES: number;
    TSFNMAXTRO: number;
    TSFNNAOGAV: number;
    TSFNNAOTRO: number;
    TSFNOPECAR: number;
    TSFNPEDSUP: number;
    TSFNQTDPAR: number;
    TSFNVALINC: number;
    TSFNVLRSAN: number;
}