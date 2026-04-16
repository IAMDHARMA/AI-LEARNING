import { LiteParse } from "@llamaindex/liteparse";
import fs from "fs";
import path from "path";

const parser = new LiteParse();

// 📁 INPUT FOLDER (put all PDFs here)
const inputDir = "./pdfs";

// 📁 OUTPUT FOLDER
const outputDir = "./output";
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// 🔍 Helper function
function extract(pattern, text, group = 1) {
  const match = text.match(pattern);
  return match ? match[group].trim() : null;
}

// 🧠 Derived logic
function deriveFields(data) {
  // Age of vehicle
  if (data.Year_of_Manufacture) {
    const currentYear = new Date().getFullYear();
    data.Age_of_Vehicle = String(currentYear - parseInt(data.Year_of_Manufacture));
  }

  // EV check
  if (data.Fuel_Type) {
    data["EV_Y/N"] = data.Fuel_Type.toLowerCase().includes("electric") ? "Y" : "N";
  }

  // Registered vehicle
  data.Have_you_registered_your_vehicle = data.Registration_No ? "Yes" : "No";

  return data;
}

// 📦 Main processing
async function processFile(pdfPath) {
  try {
    const result = await parser.parse(pdfPath);
    const text = result.text;

    const data = {

  Insurance_Company_Name: "National Insurance Company Limited",

  Insurance_Branch_Name: extract(
    /Office Address:\s*([^\n]+)/i,
    text
  ),

  Policy_No: extract(
    /Policy\s*Number[:\s]+(\d{10,})/i,
    text
  ),

  Policy_Insurance_Date: extract(
    /Invoice Date:\s*(\d{2}\/\d{2}\/\d{4})/i,
    text
  ),

  Risk_Start_Date: extract(
    /from.*?(\d{2}\/\d{2}\/\d{4})/i,
    text
  ),

  Risk_End_Date: extract(
    /midnight of\s*(\d{2}\/\d{2}\/\d{4})/i,
    text
  ),

  Customer_Name: extract(
    /Customer\s*Name\s*:\s*([^\n]+)/i,
    text
  ),

  // ✅ FIXED ADDRESS (customer only)
  Address: extract(
    /Address\s*:\s*(R\/O[\s\S]+?PIN:\s*\d+)/i,
    text
  ),

  phone_no: extract(
    /Mobile number.*?(\d{10})/i,
    text
  ),

  Email_id: extract(
    /E-?Mail\s*:\s*([^\s]+)/i,
    text
  ),

  State: extract(
    /State:\s*(KARNATAKA)/i,
    text
  ),

  Registration_No: extract(
    /Regn\.\s*Number\s*([A-Z0-9\-]+)/i,
    text
  ),

  Vehicle_Number: extract(
    /Regn\.\s*Number\s*([A-Z0-9\-]+)/i,
    text
  ),

  RTO_location_city: extract(
    /Regn\. Authority\s*([A-Za-z]+)/i,
    text
  ),

  Engine_No: extract(
    /Engine.*?(\w{8,})/i,
    text
  ),

  Chassis_No: extract(
    /Chassis\s*Number\s*([A-Z0-9]+)/i,
    text
  ),

  Year_of_Manufacture: extract(
    /Year of Mfg\.\s*(\d{4})/i,
    text
  ),

  Type_of_Vehicle: extract(
    /Class of Vehicle\s*([^\n]+)/i,
    text
  ),

  gvw_value: extract(
    /GVW\s*(\d+)/i,
    text
  ),

  Type_of_body: extract(
    /Body Type.*?(Tanker|Truck|Bus)/i,
    text
  ),

  Model: extract(
    /Model\s*([A-Z0-9]+)/i,
    text
  ),

  // ✅ FIXED MAKE (stop at newline)
  Make: extract(
    /Make\s*([^\n]+)/i,
    text
  ),

  Fuel_Type: extract(
    /Fuel.*?(DIESEL|PETROL|CNG|ELECTRIC)/i,
    text
  ),

  Seating_Capacity: extract(
    /Seating.*?(\d+)/i,
    text
  ),

  NCB: extract(
    /No Claim Bonus%\s*([\d\.]+)/i,
    text
  ),

  // ✅ FIXED PREMIUMS
  Basic_OD_Premium: extract(
    /Own Damage[\s\S]*?(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  Total_OD_Premium: extract(
    /Own Damage[\s\S]*?(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  Basic_TP_Premium: extract(
    /Legal Liability Cover\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  CPA: extract(
    /Personal Accident.*?(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  // ✅ CLEAN number only
  Total_TP_Premium: extract(
    /Total\s+(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  GST_Amount: extract(
    /CGST.*?(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  GST_Amount1: extract(
    /SGST.*?(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  NET_Premium: extract(
    /Premium\s*`\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  Total: extract(
    /Total Amount\s*`\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    text
  ),

  Vizza_name: extract(
    /(VIZZA INSURANCE BROKING SERVICES PVT LTD)/i,
    text,
    1
  )
};
    

    // 🧠 Derived fields
    const finalData = deriveFields(data);

    // 📄 File name
    const baseName = path.basename(pdfPath, ".pdf");

    // 💾 Save TXT
    fs.writeFileSync(`${outputDir}/${baseName}.txt`, text, "utf-8");

    // 💾 Save JSON
    fs.writeFileSync(
      `${outputDir}/${baseName}.json`,
      JSON.stringify(finalData, null, 2),
      "utf-8"
    );

    console.log(`✅ Processed: ${baseName}`);

  } catch (err) {
    console.error(`❌ Error processing ${pdfPath}`, err.message);
  }
}

// 🔁 Batch processing
async function main() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".pdf"));

  for (const file of files) {
    const fullPath = path.join(inputDir, file);
    await processFile(fullPath);
  }

  console.log("🚀 All files processed!");
}

main();