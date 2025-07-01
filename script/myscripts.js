const sheetID = '1oblLF_rrVzD7_rWUCPtY2qSjHChsViXo5M2hrtDPvTY';
const sheetName = 'Form Responses 1';
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;


//google form data insert 
$.get(url, function(response) {
    const json = JSON.parse(response.substr(47).slice(0, -2));
    const data = json.table.rows;
    const headers = json.table.cols.map(col => col.label || "");

    let html = '<table><thead><tr>';
    headers.slice(1).forEach(header => {  // Skip first column
    html += `<th>${header}</th>`;
    });
    html += '<th>Action</th></tr></thead><tbody>';

    data.forEach(row => {
    html += '<tr>';
    const rowData = row.c.map(cell => (cell ? cell.v : ''));
    rowData.slice(1).forEach(cellVal => {  // Skip first column
        html += `<td>${cellVal}</td>`;
    });

    const rowDataStr = rowData.slice(1).join('|'); // Store without first column
    html += `<td><button class="show-btn" data-row="${rowDataStr}">Show</button></td>`;
    html += '</tr>';
    });

    html += '</tbody></table>';
    $('#table-container').html(html);
});

// Show modal
$(document).on('click', '.show-btn', function () {
    const rowData = $(this).data('row').split('|');
    let html = '<table><tbody>';
    rowData.forEach((val, index) => {
    html += `<tr><td><strong>Column ${index + 1}</strong></td><td>${val}</td></tr>`;
    });
    html += '</tbody></table>';

    $('#popupContent').html(html);
    $('#popup').css('display', 'block');
});

function closePopup() {
    $('#popup').css('display', 'none');
}

// Download PDF
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const content = document.getElementById('popupContent');

    const canvas = await html2canvas(content, {
    scale: 2,
    useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;
    while (y < imgHeight) {
    pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
    y += pageHeight;
    if (y < imgHeight) pdf.addPage();
    }

    pdf.save('row-data.pdf');
}