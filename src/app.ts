import express from 'express';
import bodyParser, { json } from 'body-parser';
import cors                 from 'cors';
import { as_ErrorResponse } from '@root/utils';
import * as as_routes       from '@root/routes';
import { as_errorHandler}   from '@root/middleware';
import { StatusCodes }      from 'http-status-codes';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/artsystem-api',                           as_routes.as_authRoutes);
app.use('/artsystem-api/api-entity',                as_routes.as_api_entRoutes);
app.use('/artsystem-api/address',                   as_routes.as_api_addressRoutes);
app.use('/artsystem-api/address-routes',            as_routes.as_api_geoLocationRoutes);
app.use('/artsystem-api/entity',                    as_routes.as_entRoutes);        // ASENTENT
app.use('/artsystem-api/entity-carrier',            as_routes.as_traRoutes);        // ASENTTRA
app.use('/artsystem-api/entity-driver',             as_routes.as_motRoutes);        // ASENTMOT
app.use('/artsystem-api/entity-seller',             as_routes.as_venRoutes);        // ASENTVEN
app.use('/artsystem-api/entity-seller-product',     as_routes.as_venproRoutes);     // ASENTVEN_PRO
app.use('/artsystem-api/entity-standard',           as_routes.as_divRoutes);        // ASENTDIV
app.use('/artsystem-api/entity-standard-product',   as_routes.as_divproRoutes);     // ASENTDIV_PRO
app.use('/artsystem-api/menu',                      as_routes.as_menRoutes);        // ASCADMEN
app.use('/artsystem-api/user-stores',               as_routes.as_usulojRoutes);     // ASENTUSU_LOJ
app.use('/artsystem-api/user-menu',                 as_routes.as_usumenRoutes);     // ASENTUSU_MEN
app.use('/artsystem-api/entity-phone',              as_routes.as_telRoutes);        // ASENTTEL
app.use('/artsystem-api/entity-address',            as_routes.as_edrRoutes);        // ASENTEDR
app.use('/artsystem-api/entity-street',             as_routes.as_cepRoutes);        // ASCEPCEP
app.use('/artsystem-api/entity-neighborhood',       as_routes.as_baiRoutes);        // ASCEPBAI
app.use('/artsystem-api/entity-city',               as_routes.as_munRoutes);        // ASCEPMUN
app.use('/artsystem-api/buyer',                     as_routes.as_comRoutes);        // ASENTCOM
app.use('/artsystem-api/client',                    as_routes.as_cliRoutes);        // ASENTCLI
app.use('/artsystem-api/client-product',            as_routes.as_cliproRoutes);     // ASENTCLI_PRO
app.use('/artsystem-api/client-car',                as_routes.as_clicarRoutes);     // ASENTCLI_CAR
app.use('/artsystem-api/supplier',                  as_routes.as_fncRoutes);        // ASENTFNC
app.use('/artsystem-api/commission',                as_routes.as_cencomRoutes);     // ASENTCEN_COM
app.use('/artsystem-api/commission-client',         as_routes.as_cencliRoutes);     // ASENTCEN_CLI
app.use('/artsystem-api/store',                     as_routes.as_lojRoutes);        // ASENTLOJ
app.use('/artsystem-api/product',                   as_routes.as_proRoutes);        // ASPROPRO
app.use('/artsystem-api/product-barcode',           as_routes.as_eanRoutes);        // ASPROEAN
app.use('/artsystem-api/product-association',       as_routes.as_assRoutes);        // ASPROASS
app.use('/artsystem-api/product-kit',               as_routes.as_kitRoutes);        // ASPROKIT
app.use('/artsystem-api/product-scale',             as_routes.as_balRoutes);        // ASPROBAL
app.use('/artsystem-api/product-nutrition',         as_routes.as_balRoutes);        // ASPRONUT
app.use('/artsystem-api/product-image',             as_routes.as_api_proimgRoutes); // ASAPIPRO_IMG
app.use('/artsystem-api/department',                as_routes.as_depRoutes);        // ASPRODEP
app.use('/artsystem-api/reference',                 as_routes.as_refRoutes);        // ASPROREF
app.use('/artsystem-api/price',                     as_routes.as_preRoutes);        // ASPROPRE
app.use('/artsystem-api/price-table',               as_routes.as_ptpRoutes);        // ASPROTAB
app.use('/artsystem-api/product-tax',               as_routes.as_incRoutes);        // ASPROINC
app.use('/artsystem-api/product-tax-config',        as_routes.as_figRoutes);        // ASPROFIG
app.use('/artsystem-api/product-rankings',          as_routes.as_ranvdaRoutes);     // ASPROMOV_RAN
app.use('/artsystem-api/stock',                     as_routes.as_estRoutes);        // ASPROEST
app.use('/artsystem-api/stock-damaged',             as_routes.as_estavaRoutes);     // ASPROEST_AVA
app.use('/artsystem-api/description',               as_routes.as_gerRoutes);        // ASCADGER
app.use('/artsystem-api/payment-settings',          as_routes.as_tsfRoutes);        // ASTESFIN
app.use('/artsystem-api/order',                     as_routes.as_cabRoutes);        // ASPEDCAB
app.use('/artsystem-api/order-settings',            as_routes.as_pgeRoutes);        // ASPGEPGE
app.use('/artsystem-api/order-settings-cfop',       as_routes.as_pgecfoRoutes);     // ASPGECFO
app.use('/artsystem-api/order-reference',           as_routes.as_cabrefRoutes);     // ASPEDCAB_REF
app.use('/artsystem-api/order-pluggto',             as_routes.as_cabplgRoutes);     // ASPEDCAB_PLG
app.use('/artsystem-api/order-tickets',             as_routes.as_cabcomanRoutes);   // ASPEDCAB_PLG
app.use('/artsystem-api/Order-os',                  as_routes.as_cab_osRoutes);     // ASPEDCOMAN
app.use('/artsystem-api/Order-os-item',             as_routes.as_cabiosRoutes);     // ASPEDCAB_OS_ITE
app.use('/artsystem-api/Order-detail',              as_routes.as_cabobsRoutes);     // ASPEDCAB_OBS
app.use('/artsystem-api/Order-commission',          as_routes.as_cabcomRoutes);     // ASPEDCAB_COM
app.use('/artsystem-api/Order-payment-method',      as_routes.as_cabfinRoutes);     // ASPEDCAB_FIN
app.use('/artsystem-api/Order-item',                as_routes.as_iteRoutes);        // ASPEDITE
app.use('/artsystem-api/Order-item-detail',         as_routes.as_iteobsRoutes);     // ASPEDITE_OBS
app.use('/artsystem-api/Order-item-environment',    as_routes.as_iteambRoutes);     // ASPEDITE_AMB
app.use('/artsystem-api/Order-item-association',    as_routes.as_iteassRoutes);     // ASPEDITE_ASS
app.use('/artsystem-api/Order-item-sales',          as_routes.as_itedisRoutes);     // ASPEDITE_DIS
app.use('/artsystem-api/Order-item-sold',           as_routes.as_itedisRoutes);     // ASPEDITE_DIS_BXA
app.use('/artsystem-api/Order-picking',             as_routes.as_iteentRoutes);     // ASPEDITE_ENT
app.use('/artsystem-api/Order-picking-item',        as_routes.as_iteentRoutes);     // ASPEDITE_ENT_ITE
app.use('/artsystem-api/financial-details',         as_routes.as_vdafinRoutes);     // ASVALFIN

app.all('*',(req, res, next)=> {
    throw new as_ErrorResponse(`invalid Url ${req.originalUrl}`,StatusCodes.NOT_FOUND)
})
app.use(as_errorHandler)

export default app;
