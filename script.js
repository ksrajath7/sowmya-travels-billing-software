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

    // Preset car dropdown sync & auto-fill logic
    const vehicleSelect = document.getElementById('vehicleSelect');
    const vehicleTypeInput = document.getElementById('vehicleType');

    function syncVehicleSelect() {
        if (vehicleSelect && vehicleTypeInput) {
            const val = vehicleTypeInput.value.trim().toLowerCase();
            const matchingOption = Array.from(vehicleSelect.options).find(opt => opt.value.toLowerCase() === val);
            if (matchingOption) {
                vehicleSelect.value = matchingOption.value;
            } else {
                vehicleSelect.value = '';
            }
        }
    }

    if (vehicleSelect && vehicleTypeInput) {
        vehicleSelect.addEventListener('change', () => {
            if (vehicleSelect.value) {
                vehicleTypeInput.value = vehicleSelect.value;
                updatePreview('vehicleType', vehicleSelect.value);
            }
        });
    }

    // Preset client dropdown sync & auto-fill logic
    const clientSelect = document.getElementById('clientSelect');
    const customerNameInput = document.getElementById('customerName');
    const customerGSTInput = document.getElementById('customerGST');

    const clientPresets = {
        'sun_pharma': {
            nameAddress: `Sun Pharmaceutical Industries Ltd.
11/467, C.MADAVANA, NEAR
LAKESHORE HOSPITAL,
PANANGAD – 682506
COCHIN`,
            gst: '32AADCS3124K1ZM'
        },
        'lupin': {
            nameAddress: `Lupin Limited
9/520,
LeoLogistic Park,
N.H. Bypass Junction,
Kuttanellur P.O,
Thrissur 680014 Kerala.`,
            gst: '32AAACL1069K1Z0'
        },
        'aristo': {
            nameAddress: `Aristo Pharmaceuticals Pvt LTD
II/202 G & H,PBK MINA ROAD
VAZHAKALA
THRIKKARKARA P.O.,COCHIN-682021
PH:04842422615/675.`,
            gst: '32AAACA4495N1ZH'
        }
    };

    function syncClientSelect() {
        if (clientSelect && customerNameInput) {
            const val = customerNameInput.value.trim().toLowerCase();
            if (val.includes('sun pharmaceutical')) {
                clientSelect.value = 'sun_pharma';
            } else if (val.includes('lupin')) {
                clientSelect.value = 'lupin';
            } else if (val.includes('aristo')) {
                clientSelect.value = 'aristo';
            } else {
                clientSelect.value = '';
            }
        }
    }

    if (clientSelect && customerNameInput && customerGSTInput) {
        clientSelect.addEventListener('change', () => {
            const key = clientSelect.value;
            if (key && clientPresets[key]) {
                const preset = clientPresets[key];
                customerNameInput.value = preset.nameAddress;
                customerGSTInput.value = preset.gst;
                updatePreview('customerName', preset.nameAddress);
                updatePreview('customerGST', preset.gst);
            }
        });

        customerNameInput.addEventListener('input', () => {
            syncClientSelect();
        });
    }

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

            // Add downloaded bill to history
            saveBillToHistory();

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

    // --- History Management Functions ---

    // Clean up history entries older than 1 year (365 * 24 * 60 * 60 * 1000 milliseconds)
    function cleanOldHistory(history) {
        const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
        return history.filter(item => item.timestamp >= oneYearAgo);
    }

    function saveBillToHistory() {
        const formData = {};
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                formData[id] = input.value;
            }
        });

        const billNo = formData['billNo'] ? formData['billNo'].trim() : 'N/A';
        const customerName = formData['customerName'] || '';
        const guestName = formData['guestName'] || '';

        // Calculate current grand total
        const tripFare = parseFloat(formData['tripFare']) || 0;
        const driverBatta = parseFloat(formData['driverBatta']) || 0;
        const toll = parseFloat(formData['toll']) || 0;
        const parking = parseFloat(formData['parking']) || 0;
        const permit = parseFloat(formData['permit']) || 0;
        const total = tripFare + driverBatta + toll + parking + permit;
        const cgst = parseFloat(formData['cgst']) || 0;
        const sgst = parseFloat(formData['sgst']) || 0;
        const grandTotal = Math.round(total + cgst + sgst).toFixed(2);

        const historyItem = {
            timestamp: Date.now(),
            billNo,
            customerName,
            guestName,
            grandTotal,
            formData
        };

        let history = [];
        try {
            const stored = localStorage.getItem('bill_history');
            if (stored) {
                history = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error reading bill history from localStorage', e);
        }

        // Apply 1-year expiration filter
        history = cleanOldHistory(history);

        // Check if bill with this billNo already exists
        const existingIndex = history.findIndex(item => item.billNo === billNo);
        if (existingIndex !== -1) {
            // Replace the old one with the edited/updated one
            history[existingIndex] = historyItem;
            // Move it to the top of the history list
            const [item] = history.splice(existingIndex, 1);
            history.unshift(item);
        } else {
            // Add as a new entry to the top
            history.unshift(historyItem);
        }

        // Limit history to 1000 items
        if (history.length > 1000) {
            history = history.slice(0, 1000);
        }

        localStorage.setItem('bill_history', JSON.stringify(history));
        renderHistory();

        // Auto-expand sidebar to show the downloaded bill in history
        const historyPanel = document.getElementById('history-panel');
        if (historyPanel) {
            historyPanel.classList.remove('collapsed');
        }
    }

    function renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        let history = [];
        try {
            const stored = localStorage.getItem('bill_history');
            if (stored) {
                history = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error parsing bill history', e);
        }

        // Apply 1-year expiration filter
        const originalLength = history.length;
        history = cleanOldHistory(history);
        if (history.length !== originalLength) {
            localStorage.setItem('bill_history', JSON.stringify(history));
        }

        // Update history badge count
        const badge = document.getElementById('history-badge');
        if (badge) {
            badge.innerText = history.length;
            if (history.length === 0) {
                badge.classList.add('empty');
            } else {
                badge.classList.remove('empty');
            }
        }

        if (history.length === 0) {
            historyList.innerHTML = `<div class="history-empty-state">No bill history yet. Your bills will appear here.</div>`;
            return;
        }

        historyList.innerHTML = '';
        history.forEach(item => {
            const date = new Date(item.timestamp);
            const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Build customer label
            let displayName = item.customerName.split('\n')[0].trim();
            if (!displayName && item.guestName) {
                displayName = item.guestName.trim();
            }
            if (!displayName) {
                displayName = 'Unnamed Customer';
            }

            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            itemDiv.innerHTML = `
                <div class="history-item-header">
                    <span class="history-item-title">Bill #${item.billNo}</span>
                    <span class="history-item-amount">₹${item.grandTotal}</span>
                </div>
                <div class="history-item-subtitle" title="${displayName}">${displayName}</div>
                <div class="history-item-footer">
                    <span class="history-item-date">${timeString}</span>
                    <div class="history-item-actions">
                        <button type="button" class="history-item-btn btn-load" data-billno="${item.billNo}">Load</button>
                        <button type="button" class="history-item-btn btn-delete" data-billno="${item.billNo}">Delete</button>
                    </div>
                </div>
            `;

            // Event listeners
            itemDiv.querySelector('.btn-load').addEventListener('click', () => {
                loadBill(item.billNo);
            });
            itemDiv.querySelector('.btn-delete').addEventListener('click', () => {
                deleteBill(item.billNo);
            });

            historyList.appendChild(itemDiv);
        });
    }

    function loadBill(billNo) {
        let history = [];
        try {
            const stored = localStorage.getItem('bill_history');
            if (stored) {
                history = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading bill', e);
        }

        const item = history.find(h => h.billNo === billNo);
        if (!item) return;

        // Restore form input values
        inputs.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = item.formData[fieldId] !== undefined ? item.formData[fieldId] : '';
                updatePreview(fieldId, input.value);
            }
        });
        syncVehicleSelect();
        syncClientSelect();

        // Recalculate totals
        calculateTotals();
    }

    function deleteBill(billNo) {
        let history = [];
        try {
            const stored = localStorage.getItem('bill_history');
            if (stored) {
                history = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error deleting bill', e);
        }

        history = history.filter(h => h.billNo !== billNo);
        localStorage.setItem('bill_history', JSON.stringify(history));
        renderHistory();
    }

    // Clear history handler
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your download history?')) {
                localStorage.removeItem('bill_history');
                renderHistory();
            }
        });
    }

    // Sidebar toggle handler
    const historyPanel = document.getElementById('history-panel');
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    if (historyToggleBtn && historyPanel) {
        historyToggleBtn.addEventListener('click', () => {
            historyPanel.classList.toggle('collapsed');
        });
    }

    // Initial render
    renderHistory();
});
