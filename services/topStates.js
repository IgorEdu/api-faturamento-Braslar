'use strict'

const { sql, poolPromise } = require('../db')

class topStates {
  static async getStates() {
    try {
      const pool = await poolPromise
      return await pool.request().query(
        `SELECT ESTADO, SUM(AUX.TOT) AS TOT,
        SUM(AUX.CT_ICMS) AS CT_ICMS, SUM(AUX.CT_PIS) AS CT_PIS, SUM(AUX.CT_COFINS) AS CT_COFINS, SUM(AUX.CT_IPI) AS CT_IPI, SUM(AUX.CT_STICMS) AS CT_STICMS, 
        SUM(AUX.LIQUIDO) AS LIQUIDO, 
        SUM(AUX.BRUTO) AS BRUTO 
        FROM (
            SELECT UF.ESTADO,
                SUM(INF.QTD) AS QTD_NF, 
            CASE
              WHEN INF.PECA LIKE '110%' THEN SUM(INF.TOT*2)
              ELSE SUM(INF.TOT)
            END AS TOT,
                SUM(INF.CT_ICMS) AS CT_ICMS,SUM(INF.CT_PIS) AS CT_PIS,SUM(INF.CT_COFINS) AS CT_COFINS,SUM(INF.CT_IPI) AS CT_IPI,SUM(INF.CT_STICMS) AS CT_STICMS, 
                (SUM(INF.TOT)-SUM(INF.CT_ICMS)-SUM(INF.CT_PIS)-SUM(INF.CT_COFINS)) AS LIQUIDO , 
                (SUM(INF.TOT)+SUM(INF.CT_IPI)+SUM(INF.CT_STICMS)) AS BRUTO 
                FROM BRASLAR_26.DBO.ITENNOTA AS INF
                LEFT JOIN BRASLAR_26.DBO.NOTAFISC AS NF ON (NF.NOTA = INF.NOTA)
                --LEFT JOIN BRASLAR_26.DBO.CLIENTES AS CLI ON (CLI.CODIGO = NF.CLI)
                --LEFT JOIN BRASLAR_26.DBO.CRM_PEDIDO AS PED ON (PED.PEDIDO = INF.NUMPED)
                --LEFT JOIN BRASLAR_26.DBO.FORNECED AS F ON (F.CODIGO = PED.CODIGO_FORNECEDOR)
                --INCLUSÃO DE TABELA CFOP
                LEFT JOIN BRASLAR_26.DBO.CT_NOME_CFOP NCFOP ON (INF.CFOP = NCFOP.CFOP)
                LEFT JOIN BRASLAR_26.DBO.ESTOQUE EST ON (EST.CODIGO = INF.PECA)
                LEFT JOIN BRASLAR_26.DBO.GRUPOE FAMI ON (FAMI.GRUPO = EST.FAMILIA)
                LEFT JOIN BRASLAR_26.DBO.GRUPO_EST GRU ON (GRU.CODIGO = EST.CODGRUPO)
                LEFT JOIN BRASLAR_26.DBO.CT_NOME_CFOP CFOP ON (CFOP.CFOP = NF.CFOP)
                LEFT JOIN BRASLAR_26.DBO.CT_TIPOS_CFOP TCFOP ON (TCFOP.CODIGO = CFOP.TIPO_CFOP)
                LEFT JOIN BRASLAR_26.DBO.ESTADOS UF ON (UF.SIGLA = NF.ESTADO)
                WHERE NF.SITUACAO = 'IMPRESSA'
                AND (MONTH(NF.EMI) = MONTH(GETDATE()) AND YEAR(NF.EMI) = YEAR(GETDATE()))
                AND GRU.CODIGO IN ('10010','10020','10030','10040','10050','10060','11010','11020','11030','11040','11050','11060')
                GROUP BY UF.ESTADO, INF.PECA
        ) AS AUX
        GROUP BY AUX.ESTADO
        ORDER BY SUM(AUX.TOT) DESC`
      )
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = topStates