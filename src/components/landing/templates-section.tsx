const TEMPLATES = [
  { id: "classic", name: "Classic", accent: "border-primary", headerBg: "bg-primary/5", titleColor: "text-primary", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-gray-100", totalColor: "text-primary" },
  { id: "modern", name: "Modern", accent: "border-blue-500", headerBg: "bg-blue-50", titleColor: "text-blue-600", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-blue-50/50", totalColor: "text-blue-600" },
  { id: "minimal", name: "Minimal", accent: "border-gray-300", headerBg: "bg-gray-50", titleColor: "text-gray-700", bodyBg: "bg-white", textColor: "text-gray-700", mutedColor: "text-gray-300", lineBg: "bg-gray-50", totalColor: "text-gray-800" },
  { id: "corporate", name: "Corporate", accent: "border-emerald-500", headerBg: "bg-emerald-50", titleColor: "text-emerald-700", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-emerald-50/50", totalColor: "text-emerald-700" },
  { id: "creative", name: "Creative", accent: "border-teal-500", headerBg: "bg-teal-50", titleColor: "text-teal-700", bodyBg: "bg-white", textColor: "text-gray-800", mutedColor: "text-gray-400", lineBg: "bg-teal-50/50", totalColor: "text-teal-700" },
  { id: "dark", name: "Dark", accent: "border-gray-700", headerBg: "bg-gray-800", titleColor: "text-white", bodyBg: "bg-gray-900", textColor: "text-gray-200", mutedColor: "text-gray-500", lineBg: "bg-gray-800", totalColor: "text-green-400" },
];

export default function TemplatesSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-text-primary text-center mb-3">
          Choose the template that suits you
        </h2>
        <p className="text-text-secondary text-center mb-12">
          Professional, ready-to-use invoice templates
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="group cursor-pointer">
              <div
                className={`${template.bodyBg} rounded-xl border-2 ${template.accent} overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1`}
              >
                {/* Detailed Mini Preview */}
                <div className="aspect-[3/4] p-4 flex flex-col">
                  {/* Header bar */}
                  <div className={`h-6 rounded-sm mb-2 ${template.headerBg}`} />
                  {/* Title + Company */}
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className={`text-[8px] font-bold tracking-wider leading-tight ${template.titleColor}`}
                    >
                      INVOICE
                      <div className={`text-[6px] font-normal mt-0.5 ${template.mutedColor}`}>
                        #INV-001
                      </div>
                    </div>
                    <div className={`text-[6px] text-right leading-tight ${template.mutedColor}`}>
                      <div className={`text-[7px] font-bold ${template.textColor}`}>Acme Co.</div>
                      hello@acme.com
                    </div>
                  </div>
                  {/* Bill To */}
                  <div className={`rounded px-2 py-1 mb-2 ${template.lineBg}`}>
                    <div className={`text-[5px] uppercase font-bold tracking-wider ${template.mutedColor}`}>Bill To</div>
                    <div className={`text-[6px] font-medium ${template.textColor}`}>Example Client</div>
                  </div>
                  {/* Line items */}
                  <div className="space-y-0.5 flex-1">
                    <div className={`flex justify-between text-[5px] font-bold pb-0.5 border-b ${template.mutedColor} ${template.id === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                      <span>Description</span>
                      <span>Amount</span>
                    </div>
                    {["Web Design", "Development", "Hosting"].map((item) => (
                      <div key={item} className="flex justify-between text-[6px]">
                        <span className={template.textColor}>{item}</span>
                        <span className={template.mutedColor}>$XXX.XX</span>
                      </div>
                    ))}
                  </div>
                  {/* Total */}
                  <div
                    className={`mt-auto pt-2 border-t ${
                      template.id === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[6px] ${template.mutedColor}`}>Total</span>
                      <span className={`text-[8px] font-bold ${template.totalColor}`}>$X,XXX.XX</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-text-primary text-center mt-3">
                {template.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
