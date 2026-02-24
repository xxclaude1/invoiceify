export default function TemplatesSection() {
  const templates = [
    { name: "Classic", color: "bg-white", accent: "border-primary" },
    { name: "Modern", color: "bg-white", accent: "border-accent" },
    { name: "Minimal", color: "bg-white", accent: "border-gray-300" },
    { name: "Corporate", color: "bg-white", accent: "border-blue-500" },
    { name: "Creative", color: "bg-white", accent: "border-purple-500" },
    { name: "Dark", color: "bg-gray-900", accent: "border-gray-700" },
  ];

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
          {templates.map((template) => (
            <div
              key={template.name}
              className="group cursor-pointer"
            >
              <div
                className={`${template.color} rounded-xl border-2 ${template.accent} overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-1`}
              >
                {/* Mock Invoice Preview */}
                <div className="aspect-[3/4] p-4 flex flex-col">
                  {/* Header bar */}
                  <div
                    className={`h-8 rounded-md mb-3 ${
                      template.name === "Dark"
                        ? "bg-gray-700"
                        : template.name === "Creative"
                        ? "bg-purple-100"
                        : template.name === "Corporate"
                        ? "bg-blue-50"
                        : template.name === "Modern"
                        ? "bg-accent/10"
                        : "bg-primary/5"
                    }`}
                  />

                  {/* "INVOICE" text */}
                  <div className="flex justify-between mb-4">
                    <div
                      className={`text-[10px] font-bold tracking-wider ${
                        template.name === "Dark"
                          ? "text-white"
                          : "text-text-primary"
                      }`}
                    >
                      INVOICE
                    </div>
                    <div className="w-8 h-8 bg-primary/10 rounded" />
                  </div>

                  {/* Mock lines */}
                  <div className="space-y-2 flex-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <div
                          className={`h-2 rounded-full flex-1 ${
                            template.name === "Dark"
                              ? "bg-gray-700"
                              : "bg-gray-100"
                          }`}
                        />
                        <div
                          className={`h-2 rounded-full w-12 ${
                            template.name === "Dark"
                              ? "bg-gray-600"
                              : "bg-gray-200"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Mock total */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex justify-between">
                      <div
                        className={`h-2 w-12 rounded-full ${
                          template.name === "Dark"
                            ? "bg-gray-600"
                            : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-2 w-16 rounded-full ${
                          template.name === "Dark"
                            ? "bg-accent"
                            : "bg-primary/30"
                        }`}
                      />
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
