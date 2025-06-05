import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportReportToExcel(costs, revenues, totalCost, totalRevenue, vatTax, profit) {
  const wsData = [
    ["Báo cáo doanh thu & chi phí"],
    [],
    ["Chi phí"],
    ["Ngày nhập", "Tên nguyên liệu", "Số lượng", "Đơn giá", "Thành tiền"],
    ...costs.map(item => [
      item.date ? new Date(item.date).toLocaleDateString() : "",  
      item.name || "",       
      item.quantity || 0,    
      item.price || 0,       
      (item.quantity || 0) * (item.price || 0)
    ]),
    ["Tổng chi phí", "", "", "", totalCost],
    [],
    ["Doanh thu"],
    ["Ngày nhập", "Tên món bán", "Số lượng bán", "Giá bán", "Thành tiền"],
    ...revenues.map(item => [
      item.date ? new Date(item.date).toLocaleDateString() : "",  
      item.itemName || "",   
      item.quantity || 0,    
      item.price || 0,       
      (item.quantity || 0) * (item.price || 0)
    ]),
    ["Tổng doanh thu", "", "", "", totalRevenue],
    [],
    ["Thuế VAT 10%", "", "", "", vatTax],
    ["Lợi nhuận", "", "", "", profit],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Định dạng style đơn giản cho các ô header (in đậm, nền màu nhạt)
  const headerRows = [3, 11]; // chỉ số hàng bắt đầu của tiêu đề chi phí & doanh thu (0-based)
  const headersRange = [0, 1, 2, 3, 4]; // các cột A->E (0->4)

  headerRows.forEach(row => {
    headersRange.forEach(col => {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "D9E1F2" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          }
        };
      }
    });
  });

  // Định dạng in đậm cho dòng tổng
  const totalRows = [costs.length + 4, costs.length + revenues.length + 11];
  totalRows.forEach(row => {
    headersRange.forEach(col => {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "FFF2CC" } },
          alignment: { horizontal: col === 0 ? "left" : "right", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          }
        };
      }
    });
  });

  // Chỉnh độ rộng các cột (theo thứ tự cột)
  ws['!cols'] = [
    { wch: 15 }, // Ngày nhập
    { wch: 30 }, // Tên nguyên liệu / món bán
    { wch: 12 }, // Số lượng
    { wch: 12 }, // Đơn giá / Giá bán
    { wch: 15 }, // Thành tiền
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");

  // Khi viết file, bật s = true để áp style
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "BaoCaoDoanhThu.xlsx");
}
