import { generateInvoicePDF } from "../utils/generateInvoice";

function InvoiceButton({ userAddress }) {
    return (
        <button
            onClick={() => generateInvoicePDF(userAddress)}
            className="px-4 py-2 bg-green-500 text-white font-bold rounded-md"
        >
            Generate Invoice
        </button>
    );
}

export default InvoiceButton;
