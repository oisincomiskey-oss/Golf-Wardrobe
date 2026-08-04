import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { AIQuizAnswers, AIRecommendationResponse } from '../types';
import { Sparkles, ArrowRight, RotateCcw, Crown, Check, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';

export const AIFinderPage: React.FC = () => {
  const { products, addToCart, navigateTo, triggerToast, storeSettings } = useStore();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<AIQuizAnswers>({
    clubFit: '',
    style: '',
    budget: '',
    genuineLeather: '',
    waterproof: '',
    context: '',
    preferredColours: '',
    personality: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<AIRecommendationResponse | null>(null);

  const questions = [
    {
      key: 'clubFit',
      question: 'What club are you buying for?',
      subtitle: 'Select the club head in your bag that needs protection.',
      options: ['Driver', '3 Wood', 'Hybrid', 'Blade Putter', 'Mallet Putter', 'Other']
    },
    {
      key: 'style',
      question: 'What style do you like best?',
      subtitle: 'Choose your desired visual aesthetic on the golf course.',
      options: ['Luxury', 'Funny', 'Animal', 'Irish', 'Classic', 'Minimal']
    },
    {
      key: 'budget',
      question: "What's your budget?",
      subtitle: 'We offer options for every level of craftsmanship.',
      options: ['Under €30', '€30-50', '€50+']
    },
    {
      key: 'genuineLeather',
      question: 'Do you want genuine leather?',
      subtitle: 'Authentic Italian saddle & Napa leather acquires a rich patina over time.',
      options: ['Yes', 'No']
    },
    {
      key: 'waterproof',
      question: 'Does it need to be waterproof?',
      subtitle: 'Essential for golfers playing wet morning rounds or links courses.',
      options: ['Yes', 'No']
    },
    {
      key: 'context',
      question: 'Buying for yourself or as a gift?',
      subtitle: 'We include complimentary luxury gift boxing for all orders.',
      options: ['For Myself', 'As a Gift']
    },
    {
      key: 'preferredColours',
      question: 'What colours do you like?',
      subtitle: 'Match your bag design or golf cart aesthetic.',
      options: ['Classic Saddle Brown', 'Matte Black & Gold', 'Emerald Irish Green', 'Plush Animal Tones', 'Neutral Beige']
    },
    {
      key: 'personality',
      question: 'What is your golfer personality?',
      subtitle: 'How do you approach your 18-hole rounds?',
      options: ['Serious Competitor', 'Weekend Social Player', 'Banter & Humorist', 'Links Tradition Lover']
    }
  ];

  const handleOptionSelect = (key: string, value: string) => {
    const updatedAnswers = { ...answers, [key]: value };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step completed -> Request recommendations from Gemini API
      submitToGemini(updatedAnswers);
    }
  };

  const submitToGemini = async (finalAnswers: AIQuizAnswers) => {
    setIsLoading(true);
    try {
      // Omit large base64 image strings from inventory payload sent to API
      const sanitizedInventory = products.map(({ image, additionalImages, ...rest }) => rest);

      const response = await fetch('/api/ai-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          inventory: sanitizedInventory
        })
      });

      if (!response.ok) {
        throw new Error(`AI Finder request returned status ${response.status}`);
      }

      const data: AIRecommendationResponse = await response.json();
      if (!data || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid AI response structure');
      }

      setRecommendationResult(data);
      triggerToast('Gemini AI has curated your recommendations!', 'success');
    } catch (err) {
      console.error('AI Finder request error:', err);
      // Construct fallback recommendations if fetch fails
      const fallbackRecs = products.slice(0, 3).map((p) => ({
        productId: p.id,
        reason: `Selected for your ${p.clubFit || 'club'} with ${p.material || 'leather'} and ${p.category} styling.`,
        matchScore: 92
      }));
      setRecommendationResult({
        summary: `Based on your selection for ${finalAnswers.clubFit || 'your club'} with a preference for ${finalAnswers.style || 'luxury'} styling, here are our top handcrafted recommendations.`,
        recommendations: fallbackRecs
      });
      triggerToast('Loaded concierge recommendations.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({
      clubFit: '',
      style: '',
      budget: '',
      genuineLeather: '',
      waterproof: '',
      context: '',
      preferredColours: '',
      personality: ''
    });
    setRecommendationResult(null);
  };

  const currentQ = questions[currentStep];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A24D]/20 border border-[#C9A24D]/40 text-[#C9A24D] text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" /> AI Luxury Concierge
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A1A]">
          AI Headcover Finder
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
          Powered by Gemini AI. Answer a few questions about your golf bag, style preferences, and game—and our concierge will curate your perfect headcovers.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-12 border border-[#E5DEC9] shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center text-[#C9A24D] mx-auto animate-spin">
            <Loader2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Consulting Gemini AI...</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Analyzing leather grains, club head fit dimensions, waterproofing specs, and your player personality...
            </p>
          </div>
        </div>
      )}

      {/* Recommendation Results View */}
      {!isLoading && recommendationResult && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Summary Box */}
          <div className="bg-[#1A1A1A] text-white p-8 rounded-3xl border border-[#C9A24D]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#C9A24D] flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> Concierge Match Summary
              </span>
              <button
                onClick={resetQuiz}
                className="text-xs text-gray-300 hover:text-white flex items-center gap-1 font-semibold underline"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start Over
              </button>
            </div>

            <p className="font-serif text-lg sm:text-xl font-medium leading-relaxed text-gray-100">
              "{recommendationResult.summary}"
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 px-3 py-1 rounded-full text-gray-300">
                Fit: {answers.clubFit}
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-gray-300">
                Style: {answers.style}
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-gray-300">
                Leather: {answers.genuineLeather}
              </span>
            </div>
          </div>

          {/* Recommended Product Cards List */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A24D]" /> Handpicked Recommendations For Your Bag
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendationResult.recommendations.map((rec) => {
                const product = products.find((p) => p.id === rec.productId) || products[0];
                return (
                  <div
                    key={rec.productId}
                    className="bg-white rounded-3xl p-6 border border-[#E5DEC9] shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden group"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-28 h-28 object-cover rounded-2xl bg-[#F5F1E8] shrink-0 border border-[#E5DEC9]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A24D]">
                            {product.category} • {product.clubFit}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {rec.matchScore}% Match
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] line-clamp-1 mb-1">
                          {product.name}
                        </h3>

                        <p className="font-serif text-base font-bold text-[#1A1A1A]">
                          {storeSettings.currencySymbol}{product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* AI Explanation Box */}
                    <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9] text-xs text-gray-700 space-y-1">
                      <p className="font-semibold text-[#1A1A1A] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5 text-[#C9A24D]" /> Concierge Recommendation Reason:
                      </p>
                      <p className="italic text-gray-600">"{rec.reason}"</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => navigateTo('product', { productId: product.id })}
                        className="flex-1 bg-[#1A1A1A] hover:bg-[#C9A24D] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={resetQuiz}
              className="bg-[#1A1A1A] text-white hover:bg-[#C9A24D] px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
            >
              Take AI Finder Quiz Again
            </button>
          </div>
        </div>
      )}

      {/* Step-By-Step Questionnaire Wizard */}
      {!isLoading && !recommendationResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#E5DEC9] shadow-xl space-y-8">
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span className="text-[#C9A24D]">{Math.round(((currentStep + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-[#F5F1E8] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#C9A24D] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question Block */}
          <div className="space-y-3 text-center max-w-xl mx-auto pt-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {currentQ.question}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              {currentQ.subtitle}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
            {currentQ.options.map((option) => {
              const isSelected = answers[currentQ.key as keyof AIQuizAnswers] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(currentQ.key, option)}
                  className={`p-5 rounded-2xl border-2 text-left font-serif text-base font-semibold transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                      : 'bg-[#FAF8F5] text-[#1A1A1A] border-[#E5DEC9] hover:border-[#C9A24D] hover:bg-white'
                  }`}
                >
                  <span>{option}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-[#C9A24D] border-[#C9A24D] text-white' : 'border-[#E5DEC9] group-hover:border-[#C9A24D]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-[#F5F1E8] max-w-2xl mx-auto">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors ${
                currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-[#F5F1E8]'
              }`}
            >
              &larr; Back
            </button>

            <button
              onClick={resetQuiz}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Reset Answers
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
