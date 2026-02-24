"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { WizardProvider, useWizard } from "@/components/wizard/wizard-context";
import StepIndicator from "@/components/wizard/step-indicator";
import StepDocument from "@/components/wizard/step-document";
import StepContent from "@/components/wizard/step-content";
import StepItems from "@/components/wizard/step-items";
import StepTemplate from "@/components/wizard/step-template";
import DocumentPreview from "@/components/wizard/document-preview";
import Button from "@/components/ui/button";

function WizardContent() {
  const { state, nextStep, prevStep, canProceed } = useWizard();

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return <StepDocument />;
      case 2:
        return <StepContent />;
      case 3:
        return <StepItems />;
      case 4:
        return <StepTemplate />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step Indicator */}
          <div className="mb-6">
            <StepIndicator />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                {renderStep()}

                {/* Navigation */}
                {state.step < 4 && (
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      {state.step > 1 && (
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={prevStep}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          Back
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={nextStep}
                      disabled={!canProceed}
                      className={
                        !canProceed ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      Continue
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </div>
                )}

                {state.step === 4 && (
                  <div className="mt-4 flex justify-start">
                    <Button variant="ghost" size="md" onClick={prevStep}>
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Live Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <DocumentPreview />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CreatePage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
