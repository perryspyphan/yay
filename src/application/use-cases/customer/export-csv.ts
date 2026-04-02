import { Customer } from "@/domain/entities/Customer";

export function exportCustomersToCSV(customers: Customer[]) {
  let csv = '\uFEFFMã KH,Tên KH,Điện thoại,Email,Hạng,Tổng bán (VNĐ),Ngày tạo\n';
  customers.forEach(c => {
    csv += [c.id, `"${c.name}"`, c.phone || '', c.email || '', c.tier, c.total, c.created_at].join(',') + '\n';
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = 'DGFarm_KhachHang.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}