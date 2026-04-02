export const exportToCSV = (contacts: any[], filename = "crm_contacts.csv") => {
  if (contacts.length === 0) return;

  const headers = ["Name", "Email", "Phone", "Company", "Status", "Created At"];
  
  const csvRows = [
    headers.join(","), // Header row
    ...contacts.map(c => 
      [
        `"${c.name}"`, 
        `"${c.email || ""}"`, 
        `"${c.phone || ""}"`, 
        `"${c.company || ""}"`, 
        `"${c.status}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`
      ].join(",")
    )
  ];

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  
  link.click();
  document.body.removeChild(link);
};
