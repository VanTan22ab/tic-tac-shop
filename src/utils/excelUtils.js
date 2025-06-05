import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportReportToExcel(
  costs,
  revenues,
  totalCost,
  totalRevenue,
  vatTax,
  profit
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Báo cáo");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace("₫", "") + " đ";

  // Tiêu đề chính
  worksheet.mergeCells("A1:G1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "Báo cáo doanh thu & chi phí";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // VAT và Lợi nhuận (trên đầu)
  worksheet.getCell("A2").value = "Thuế VAT 10%";
  worksheet.getCell("A2").font = { bold: true };
  worksheet.getCell("B2").value = formatCurrency(vatTax);
  worksheet.getCell("B2").alignment = { horizontal: "right" };

  worksheet.getCell("A3").value = "Lợi nhuận";
  worksheet.getCell("A3").font = { bold: true };
  worksheet.getCell("B3").value = formatCurrency(profit);
  worksheet.getCell("B3").alignment = { horizontal: "right" };
  // VAT và Lợi nhuận (trên đầu)
  const vatCellF = worksheet.getCell("A2");
  const vatCellG = worksheet.getCell("B2");
  const profitCellF = worksheet.getCell("A3");
  const profitCellG = worksheet.getCell("B3");

  // Thiết lập font đậm, căn phải cho số tiền, căn trái/trung bình cho label
  [vatCellF, profitCellF].forEach((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "left" };
  });
  [vatCellG, profitCellG].forEach((cell) => {
    cell.alignment = { horizontal: "right" };
    cell.font = { bold: false };
  });

  // Áp dụng fill màu nền và border giống applyTotalStyle
  [vatCellF, vatCellG, profitCellF, profitCellG].forEach((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9E1F2" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
  });

  // Cột cho chi phí bắt đầu từ A, doanh thu bắt đầu từ E
  let startRow = 5;

  // Chi phí
  worksheet.getCell(`A${startRow}`).value = "Chi phí";
  worksheet.getCell(`A${startRow}`).font = { bold: true };
  startRow++;

  const chiPhiHeader = worksheet.getRow(startRow++);
  chiPhiHeader.getCell("A").value = "Ngày nhập";
  chiPhiHeader.getCell("B").value = "Tên nguyên liệu";
  chiPhiHeader.getCell("C").value = "Số Tiền";
  applyHeaderStyle(chiPhiHeader);

  costs.forEach((item, index) => {
    const row = worksheet.getRow(startRow + index);
    row.getCell("A").value = item.date
      ? new Date(item.date).toLocaleDateString()
      : "";
    row.getCell("B").value = item.name || "";
    row.getCell("C").value = formatCurrency(item.price || 0);
    applyZebraStyle(row, index);
  });

  const totalCostRow = worksheet.getRow(startRow + costs.length);
  totalCostRow.getCell("A").value = "Tổng chi phí";
  totalCostRow.getCell("C").value = formatCurrency(totalCost);
  applyTotalStyle(totalCostRow);

  // Doanh thu (song song ở cột E)
  let revenueStartRow = 5;

  worksheet.getCell(`E${revenueStartRow}`).value = "Doanh thu";
  worksheet.getCell(`E${revenueStartRow}`).font = { bold: true };
  revenueStartRow++;

  const doanhThuHeader = worksheet.getRow(revenueStartRow++);
  doanhThuHeader.getCell("E").value = "Ngày nhập";
  doanhThuHeader.getCell("F").value = "Tiêu đề doanh thu";
  doanhThuHeader.getCell("G").value = "Số tiền";
  applyHeaderStyle(doanhThuHeader);

  revenues.forEach((item, index) => {
    const row = worksheet.getRow(revenueStartRow + index);
    row.getCell("E").value = item.date
      ? new Date(item.date).toLocaleDateString()
      : "";
    row.getCell("F").value = item.itemName || "";
    row.getCell("G").value = formatCurrency(item.price || 0);
    applyZebraStyle(row, index);
  });

  const totalRevenueRow = worksheet.getRow(revenueStartRow + revenues.length);
  totalRevenueRow.getCell("E").value = "Tổng doanh thu";
  totalRevenueRow.getCell("G").value = formatCurrency(totalRevenue);
  applyTotalStyle(totalRevenueRow);

  // Căn lề, bo viền, độ rộng cột
  worksheet.columns = [
    { header: "Ngày", key: "ngayChiPhi", width: 15 },
    { header: "Tên", key: "tenChiPhi", width: 30 },
    { header: "Số tiền", key: "soTienChiPhi", width: 20 },
    { header: "", width: 2 }, // khoảng cách giữa 2 bảng
    { header: "Ngày", key: "ngayDoanhThu", width: 15 },
    { header: "Tên", key: "tenDoanhThu", width: 30 },
    { header: "Số tiền", key: "soTienDoanhThu", width: 20 },
  ];

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "BaoCaoDoanhThu.xlsx");

  // ===== Helper Functions =====
  function applyHeaderStyle(row) {
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
      cell.alignment = { horizontal: "center" };
      cell.border = borderStyle();
    });
  }

  function applyTotalStyle(row) {
    row.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9E1F2" },
      };
      cell.alignment = { horizontal: "right" };
      cell.border = borderStyle();
    });
  }

  function applyZebraStyle(row, index) {
    const color = index % 2 === 0 ? "F2F2F2" : "FFFFFF";
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
      cell.border = borderStyle();
    });
  }

  function borderStyle() {
    return {
      top: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    };
  }
}
