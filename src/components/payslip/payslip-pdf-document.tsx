import type { PayslipData } from "@/lib/payslip-data";
import type { PayslipCompanySettings } from "@/lib/payslip-company-settings";
import { DEFAULT_PAYSLIP_LOGO_PATH } from "@/lib/payslip-company-settings";
import {
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.15,
    color: "#000",
  },
  slip: {
    borderWidth: 1.5,
    borderColor: "#000",
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderColor: "#000",
    minHeight: 135,
  },
  logoBox: {
    width: 118,
    borderRightWidth: 1.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  logo: {
    width: 86,
    height: 95,
    objectFit: "contain",
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 3,
    paddingHorizontal: 8,
  },
  companyName: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
  },
  companyAddress: {
    textAlign: "center",
    marginTop: 2,
  },
  title: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
  },
  employeeName: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: 700,
  },
  detailsWrap: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderColor: "#000",
    minHeight: 114,
  },
  detailCol: {
    flex: 1,
    paddingVertical: 3,
  },
  detailColRight: {
    borderLeftWidth: 1.5,
    borderColor: "#000",
  },
  detailRow: {
    flexDirection: "row",
    minHeight: 18,
    alignItems: "center",
    paddingHorizontal: 3,
  },
  detailLabel: {
    width: "57%",
  },
  detailValue: {
    width: "43%",
  },
  detailLabelRight: {
    width: "62%",
  },
  detailValueRight: {
    width: "38%",
  },
  tableWrap: {
    borderBottomWidth: 1.5,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 19,
  },
  tableHeaderCell: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontWeight: 700,
    textAlign: "center",
  },
  tableCell: {
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: "#000",
    paddingVertical: 2.5,
    paddingHorizontal: 3,
  },
  lastCol: {
    borderRightWidth: 0,
  },
  colLabel: {
    width: "21%",
  },
  colSmall: {
    width: "10%",
  },
  colLabelWide: {
    width: "35%",
  },
  colSmallWide: {
    width: "10%",
  },
  colGross: {
    width: "10%",
  },
  rightText: {
    textAlign: "right",
  },
  netLabelCell: {
    width: "71%",
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontWeight: 700,
  },
  netValueCell: {
    width: "29%",
    borderTopWidth: 1,
    borderColor: "#000",
    paddingVertical: 3,
    paddingHorizontal: 4,
    textAlign: "right",
    fontWeight: 700,
  },
  wordsWrap: {
    borderBottomWidth: 1.5,
    borderColor: "#000",
    minHeight: 52,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  wordsLabel: {
    fontWeight: 700,
    marginBottom: 3,
  },
  wordsText: {
    fontWeight: 700,
  },
  footerWrap: {
    minHeight: 170,
    paddingHorizontal: 5,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  forCompany: {
    textAlign: "right",
    fontWeight: 700,
    marginTop: 2,
  },
  footerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  disclaimer: {
    fontSize: 10,
  },
  signatory: {
    fontWeight: 700,
  },
});

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const toCurrencyOneDecimal = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

const amountOrDash = (value: number) => (value > 0 ? toCurrency(value) : "-");

export type PayslipPdfDocumentProps = {
  data: PayslipData;
  company: PayslipCompanySettings;
};

export function PayslipPdfDocument({ data, company }: PayslipPdfDocumentProps) {
  const logoSrc =
    company.logoDataUrl && company.logoDataUrl.startsWith("data:")
      ? company.logoDataUrl
      : DEFAULT_PAYSLIP_LOGO_PATH;

  const addressLines = company.companyAddress
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const L = company.pdfLabels;

  const earningRows = [
    ["Basic", toNumber(data.basic)],
    ["DA", toNumber(data.da)],
    ["House Rent Allowance", toNumber(data.hra)],
    ["Conveyance", toNumber(data.conveyance)],
    ["Education Allowance", toNumber(data.educationAllowance)],
    ["Other Allowance", toNumber(data.otherAllowanceOne)],
    ["LTA", toNumber(data.lta)],
    ["Washing Allowance", toNumber(data.washingAllowance)],
    ["Other Allowance", toNumber(data.otherAllowanceTwo)],
    ["Over Time Earning", toNumber(data.overtime)],
  ] as const;

  const deductionRows = [
    ["Employee Contribution to PF @ 12%", toNumber(data.pfDeduction)],
    ["Employee Contribution to ESIC @ 0.75%", toNumber(data.esicDeduction)],
    ["Professional Tax", toNumber(data.professionalTax)],
    ["LWF", toNumber(data.lwf)],
    ["Security Deposit", toNumber(data.securityDeposit)],
  ] as const;

  const totalEarnings = earningRows.reduce((sum, row) => sum + row[1], 0);
  const totalDeductions = deductionRows.reduce((sum, row) => sum + row[1], 0);
  const netAmount = totalEarnings - totalDeductions;
  const earningsWithTotal = [...earningRows, ["Total Earning", totalEarnings]] as const;
  const deductionsWithTotal = [
    ...deductionRows,
    ["Total Deduction", totalDeductions],
  ] as const;

  const leftDetails = [
    [L.employeeNo, data.employeeNo],
    [L.designation, data.designation],
    [L.location, data.location],
    [L.bankDetails, data.bankDetails],
    [L.joiningDate, data.joiningDate],
    [L.totalDays, data.totalDays],
  ] as const;

  const rightDetails = [
    [L.panNo, data.panNo],
    [L.aadharNo, data.aadharNo],
    [L.uanNo, data.uanNo],
    [L.pfAccountNo, data.pfAccountNo],
    [L.esiNo, data.esiNo],
    [L.duties, data.duties],
  ] as const;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.slip}>
          <View style={pdfStyles.header}>
            <View style={pdfStyles.logoBox}>
              <PdfImage src={logoSrc} style={pdfStyles.logo} />
            </View>
            <View style={pdfStyles.headerTextWrap}>
              <Text style={pdfStyles.companyName}>{company.companyName}</Text>
              {addressLines.map((line, i) => (
                <Text key={`addr-${i}`} style={pdfStyles.companyAddress}>
                  {line}
                </Text>
              ))}
              <Text style={pdfStyles.title}>
                {company.paySlipTitlePrefix} {data.month}
              </Text>
              <Text style={pdfStyles.employeeName}>{data.employeeName}</Text>
            </View>
          </View>

          <View style={pdfStyles.detailsWrap}>
            <View style={pdfStyles.detailCol}>
              {leftDetails.map(([label, value]) => (
                <View style={pdfStyles.detailRow} key={label}>
                  <Text style={pdfStyles.detailLabel}>{label}</Text>
                  <Text style={pdfStyles.detailValue}>{value || "-"}</Text>
                </View>
              ))}
            </View>
            <View style={[pdfStyles.detailCol, pdfStyles.detailColRight]}>
              {rightDetails.map(([label, value]) => (
                <View style={pdfStyles.detailRow} key={label}>
                  <Text style={pdfStyles.detailLabelRight}>{label}</Text>
                  <Text style={pdfStyles.detailValueRight}>{value || "-"}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={pdfStyles.tableWrap}>
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colLabel]}>Earnings</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colSmall]}>Amount</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colGross]}>Gross Salary</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colLabelWide]}>Deductions</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colSmallWide]}>Amount</Text>
              <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colGross, pdfStyles.lastCol]}>
                Gross Salary
              </Text>
            </View>

            {Array.from({ length: earningsWithTotal.length }).map((_, index) => {
              const earning = earningsWithTotal[index];
              const deduction = deductionsWithTotal[index];
              return (
                <View style={pdfStyles.tableRow} key={`${earning?.[0] ?? "e"}-${index}`}>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colLabel]}>{earning?.[0] ?? ""}</Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colSmall, pdfStyles.rightText]}>
                    {amountOrDash(earning?.[1] ?? 0)}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colGross, pdfStyles.rightText]}>
                    {amountOrDash(earning?.[1] ?? 0)}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colLabelWide]}>
                    {deduction?.[0] ?? ""}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.colSmallWide, pdfStyles.rightText]}>
                    {amountOrDash(deduction?.[1] ?? 0)}
                  </Text>
                  <Text
                    style={[
                      pdfStyles.tableCell,
                      pdfStyles.colGross,
                      pdfStyles.rightText,
                      pdfStyles.lastCol,
                    ]}
                  >
                    {amountOrDash(deduction?.[1] ?? 0)}
                  </Text>
                </View>
              );
            })}

            <View style={pdfStyles.tableRow}>
              <Text style={pdfStyles.netLabelCell}>Net Amount</Text>
              <Text style={pdfStyles.netValueCell}>{toCurrencyOneDecimal(netAmount)}</Text>
            </View>
          </View>

          <View style={pdfStyles.wordsWrap}>
            <Text style={pdfStyles.wordsLabel}>Amount (in words):</Text>
            <Text style={pdfStyles.wordsText}>{data.amountInWords}</Text>
          </View>

          <View style={pdfStyles.footerWrap}>
            <Text style={pdfStyles.forCompany}>For {company.footerLegalName}</Text>
            <View style={pdfStyles.footerBottom}>
              <Text style={pdfStyles.disclaimer}>{company.disclaimerText}</Text>
              <Text style={pdfStyles.signatory}>{company.signatoryTitle}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
