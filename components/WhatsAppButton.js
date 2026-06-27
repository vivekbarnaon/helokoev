export default function WhatsAppButton({ productName, whatsappNumber }) {
  // Clean phone number: keep only digits and the optional leading plus sign
  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^0-9+]/g, "") : "";
  const encodedText = encodeURIComponent(
    `Hi, I am interested in ${productName} from HELOKOEV. Please share details.`
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center space-x-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 w-full text-center"
    >
      <svg
        className="w-5 h-5 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.864-9.83.002-2.623-1.01-5.09-2.855-6.94C16.638 1.986 14.167 1.01 11.55 1.01c-5.44 0-9.866 4.415-9.87 9.831-.001 1.77.462 3.497 1.341 5.023L1.936 21.73l6.002-1.573-.291-.173zm9.251-6.41c-.244-.122-1.44-.712-1.663-.794-.223-.082-.385-.122-.547.122-.162.244-.627.794-.77 0-.142-.815-.244-.486-.385-.73-.142-.244-.071-.462-.036-.584.035-.122.162-.244.244-.326.082-.082.162-.162.244-.244.082-.082.122-.162.183-.325.061-.162.03-.305-.015-.386-.046-.081-.385-.927-.527-1.27-.138-.335-.277-.29-.385-.295-.1-.004-.213-.005-.325-.005-.112 0-.294.041-.447.203-.152.163-.58.567-.58 1.382 0 .815.594 1.603.677 1.713.082.11 1.168 1.785 2.83 2.502.395.17.703.272.943.349.398.127.76.109 1.047.066.32-.048.985-.403 1.127-.793.143-.39.143-.73.1-.794-.042-.066-.163-.122-.407-.244z" />
      </svg>
      <span>Chat on WhatsApp 💬</span>
    </a>
  );
}
