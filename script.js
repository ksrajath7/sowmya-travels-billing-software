document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-btn');

    // List of input IDs to sync with preview
    const inputs = [
        'billNo', 'billDate', 'orderNo', 'contactNo', 
        'customerName', 'customerGST', 'tripCode', 
        'tripVoucherNo', 'tripStartDate', 'vehicleType', 
        'tripEndDate', 'vehicleNo', 'source', 'totalKms', 
        'destination', 'guestName', 'routeDetails',
        'tripFare', 'driverBatta', 'toll', 'parking', 'permit',
        'cgst', 'sgst'
    ];

    // Initialize real-time updates
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                updatePreview(id, input.value);
                if (['tripFare', 'driverBatta', 'toll', 'parking', 'permit', 'cgst', 'sgst'].includes(id)) {
                    calculateTotals();
                }
            });
        }
    });

    function updatePreview(id, value) {
        const previewElement = document.getElementById(`preview-${id}`);
        if (previewElement) {
            if (id === 'billDate' || id === 'tripStartDate' || id === 'tripEndDate') {
                previewElement.innerText = formatDate(value);
            } else if (['tripFare', 'driverBatta', 'toll', 'parking', 'permit', 'cgst', 'sgst'].includes(id)) {
                previewElement.innerText = value || '0';
            } else {
                previewElement.innerText = value;
            }
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function calculateTotals() {
        const tripFare = parseFloat(document.getElementById('tripFare').value) || 0;
        const driverBatta = parseFloat(document.getElementById('driverBatta').value) || 0;
        const toll = parseFloat(document.getElementById('toll').value) || 0;
        const parking = parseFloat(document.getElementById('parking').value) || 0;
        const permit = parseFloat(document.getElementById('permit').value) || 0;

        const total = tripFare + driverBatta + toll + parking + permit;
        const cgst = parseFloat(document.getElementById('cgst').value) || 0;
        const sgst = parseFloat(document.getElementById('sgst').value) || 0;
        const grandTotal = total + cgst + sgst;

        document.getElementById('preview-total').innerText = total.toFixed(2);
        document.getElementById('preview-cgst').innerText = cgst.toFixed(2);
        document.getElementById('preview-sgst').innerText = sgst.toFixed(2);
        document.getElementById('preview-grandTotal').innerText = Math.round(grandTotal).toFixed(2);
        document.getElementById('preview-amountPayable').innerText = Math.round(grandTotal).toFixed(2);
        
        const amountWords = numberToWords(Math.round(grandTotal));
        document.getElementById('preview-amountWords').innerText = amountWords ? `${amountWords} only` : '';
    }

    function numberToWords(number) {
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

        if (number === 0) return 'zero';

        const convert = (num) => {
            let res = '';
            if (num >= 100) {
                res += ones[Math.floor(num / 100)] + ' hundred ';
                num %= 100;
            }
            if (num >= 20) {
                res += tens[Math.floor(num / 10)] + ' ';
                num %= 10;
            } else if (num >= 10) {
                res += teens[num - 10] + ' ';
                num = 0;
            }
            if (num > 0) {
                res += ones[num] + ' ';
            }
            return res;
        };

        let result = '';
        if (number >= 10000000) {
            result += convert(Math.floor(number / 10000000)) + 'crore ';
            number %= 10000000;
        }
        if (number >= 100000) {
            result += convert(Math.floor(number / 100000)) + 'lakh ';
            number %= 100000;
        }
        if (number >= 1000) {
            result += convert(Math.floor(number / 1000)) + 'thousand ';
            number %= 1000;
        }
        result += convert(number);

        return result.trim();
    }

    // PDF Download Handler
    async function generatePDF() {
        const element = document.getElementById('bill-preview');
        const billNoInput = document.getElementById('billNo').value.trim();
        const fileName = billNoInput ? `bill-${billNoInput}.pdf` : 'bill.pdf';
        
        const originalText = downloadBtn.innerText;
        downloadBtn.innerText = 'Processing...';
        downloadBtn.disabled = true;

        try {
            // Wait a moment for all styles to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create a hidden clone for perfect capture
            const clone = element.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = '210mm';
            clone.style.minHeight = '297mm';
            clone.style.padding = '15mm';
            clone.style.transform = 'none';
            clone.style.backgroundColor = 'white';
            document.body.appendChild(clone);

            // Force capture of the clone
            const canvas = await html2canvas(clone, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: clone.offsetWidth,
                height: clone.offsetHeight
            });

            // Clean up
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });


            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Fit image perfectly to A4 dimensions
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            const blob = pdf.output('blob');
            window.saveAs(blob, fileName);

            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert('Error generating PDF. Please try refreshing and trying again.');
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        }
    }

    downloadBtn.addEventListener('click', generatePDF);


});
