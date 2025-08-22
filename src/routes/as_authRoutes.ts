import express from 'express';
import { as_authController } from '@root/controllers';
import { as_authenticateToken } from '@root/middleware';

const as_router = express.Router();

as_router.post('/oauth/token',              as_authController.as_validateToken);
as_router.all('/api-entity',                as_authenticateToken);      // ASENTAPI
as_router.all('/address',                   as_authenticateToken);      // API EXTERNA DE CONSULTA DE ENDREÇOS
as_router.all('/address-routes',            as_authenticateToken);      // API EXTERNA DE CONSULTA DE ROTAS DE ENDREÇOS
as_router.all('/entity',                    as_authenticateToken);      // ASENTENT
as_router.all('/entity-carrier',            as_authenticateToken);      // ASENTTRA
as_router.all('/entity-driver',             as_authenticateToken);      // ASENTMOT
as_router.all('/entity-seller',             as_authenticateToken);      // ASENTVEN
as_router.all('/entity-seller-product',     as_authenticateToken);      // ASENTVEN_PRO
as_router.all('/entity-standard',           as_authenticateToken);      // ASENTDIV
as_router.all('/entity-standard-product',   as_authenticateToken);      // ASENTDIV_PRO
as_router.all('/menu',                      as_authenticateToken);      // ASCADMEN
as_router.all('/user-stores',               as_authenticateToken);      // ASENTUSU_LOJ
as_router.all('/user-menu',                 as_authenticateToken);      // ASENTUSU_MEN
as_router.all('/entity-phone',              as_authenticateToken);      // ASENTTEL
as_router.all('/entity-address',            as_authenticateToken);      // ASENTEDR
as_router.all('/entity-street',             as_authenticateToken);      // ASCEPCEP
as_router.all('/entity-neighborhood',       as_authenticateToken);      // ASCEPBAI
as_router.all('/entity-city',               as_authenticateToken);      // ASCEPMUN
as_router.all('/buyer',                     as_authenticateToken);      // ASENTCOM
as_router.all('/client',                    as_authenticateToken);      // ASENTCLI
as_router.all('/client-product',            as_authenticateToken);      // ASENTCLI_PRO
as_router.all('/client-car',                as_authenticateToken);      // ASENTCLI_CAR
as_router.all('/supplier',                  as_authenticateToken);      // ASENTFNC
as_router.all('/commission',                as_authenticateToken);      // ASENTCEN_COM
as_router.all('/commission-client',         as_authenticateToken);      // ASENTCEN_CLI
as_router.all('/store',                     as_authenticateToken);      // ASENTLOJ
as_router.all('/product',                   as_authenticateToken);      // ASPROPRO
as_router.all('/product-barcode',           as_authenticateToken);      // ASPROEAN
as_router.all('/product-association',       as_authenticateToken);      // ASPROASS
as_router.all('/product-kit',               as_authenticateToken);      // ASPROKIT
as_router.all('/product-scale',             as_authenticateToken);      // ASPROBAL
as_router.all('/product-nutrition',         as_authenticateToken);      // ASPRONUT
as_router.all('/product-rankings',          as_authenticateToken);      // ASPROMOV_RAN
as_router.all('/product-image',             as_authenticateToken);      // ASAPIPRO_IMG
as_router.all('/department',                as_authenticateToken);      // ASPRODEP
as_router.all('/reference',                 as_authenticateToken);      // ASPROREF
as_router.all('/price',                     as_authenticateToken);      // ASPROPRE
as_router.all('/price-table',               as_authenticateToken);      // ASPROTAB
as_router.all('/product-tax',               as_authenticateToken);      // ASPROINC
as_router.all('/product-tax-config',        as_authenticateToken);      // ASPROFIG
as_router.all('/stock',                     as_authenticateToken);      // ASPROEST
as_router.all('/stock-damaged',             as_authenticateToken);      // ASPROEST_AVA
as_router.all('/description',               as_authenticateToken);      // ASCADGER
as_router.all('/payment-settings',          as_authenticateToken);      // ASTESFIN
as_router.all('/order',                     as_authenticateToken);      // ASPEDCAB
as_router.all('/order-settings',            as_authenticateToken);      // ASPGEPGE
as_router.all('/order-settings-cfop',       as_authenticateToken);      // ASPGECFO
as_router.all('/order-reference',           as_authenticateToken);      // ASPEDCAB_REF
as_router.all('/order-pluggto',             as_authenticateToken);      // ASPEDCAB_PLG
as_router.all('/order-tickets',             as_authenticateToken);      // ASPEDCAB_PLG
as_router.all('/Order-os',                  as_authenticateToken);      // ASPEDCOMAN
as_router.all('/Order-os-item',             as_authenticateToken);      // ASPEDCAB_OS_ITE
as_router.all('/Order-detail',              as_authenticateToken);      // ASPEDCAB_OBS
as_router.all('/Order-commission',          as_authenticateToken);      // ASPEDCAB_COM
as_router.all('/Order-payment-method',      as_authenticateToken);      // ASPEDCAB_FIN
as_router.all('/Order-item',                as_authenticateToken);      // ASPEDITE
as_router.all('/Order-item-detail',         as_authenticateToken);      // ASPEDITE_OBS
as_router.all('/Order-item-environment',    as_authenticateToken);      // ASPEDITE_AMB
as_router.all('/Order-item-association',    as_authenticateToken);      // ASPEDITE_ASS
as_router.all('/Order-item-sales',          as_authenticateToken);      // ASPEDITE_DIS
as_router.all('/Order-item-sold',           as_authenticateToken);      // ASPEDITE_DIS_BXA
as_router.all('/Order-picking',             as_authenticateToken);      // ASPEDITE_ENT
as_router.all('/Order-picking-item',        as_authenticateToken);      // ASPEDITE_ENT_ITE
as_router.all('/financial-details',         as_authenticateToken);      // ASFINFIN_DET

export default as_router; 