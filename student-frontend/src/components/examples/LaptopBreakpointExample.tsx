import React from 'react';

/**
 * LaptopBreakpointExample - Demonstrates the laptop breakpoint usage
 * 
 * This component shows various responsive patterns using the laptop (1366px) breakpoint.
 * Use this as a reference when implementing laptop-specific styling in your components.
 */
const LaptopBreakpointExample: React.FC = () => {
  return (
    <div className=\"min-h-screen bg-gray-50 p-8\">
      <div className=\"max-w-7xl mx-auto space-y-8\">
        
        {/* Header Example */}
        <section className=\"bg-white rounded-lg shadow-md p-6\">
          <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Text Sizing Example</h2>
          <div className=\"space-y-4\">
            <h1 className=\"text-2xl lg:text-3xl laptop:text-2xl xl:text-4xl font-bold text-primary-600\">
              Responsive Heading (scales down on laptop)
            </h1>
            <p className=\"text-base lg:text-lg laptop:text-base xl:text-xl text-gray-600\">
              This paragraph scales up at lg (1024px), back down at laptop (1366px), and up again at xl (1536px).
            </p>
          </div>
        </section>

        {/* Spacing Example */}
        <section className=\"bg-white rounded-lg shadow-md\">
          <div className=\"px-4 lg:px-8 laptop:px-6 xl:px-10 py-6\">
            <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Spacing Example</h2>
            <div className=\"bg-blue-100 p-4 rounded\">
              <p className=\"text-gray-700\">
                This container has responsive padding: px-4 (base) → px-8 (lg) → px-6 (laptop) → px-10 (xl)
              </p>
            </div>
          </div>
        </section>

        {/* Grid Example */}
        <section className=\"bg-white rounded-lg shadow-md p-6\">
          <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Grid Layout Example</h2>
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 laptop:grid-cols-2 xl:grid-cols-4 gap-4\">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className=\"bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg p-6 text-white\">
                <h3 className=\"text-lg font-semibold mb-2\">Card {item}</h3>
                <p className=\"text-sm\">Responsive grid card</p>
              </div>
            ))}
          </div>
          <p className=\"mt-4 text-sm text-gray-600\">
            Grid: 1 col (base) → 2 cols (md) → 3 cols (lg) → 2 cols (laptop) → 4 cols (xl)
          </p>
        </section>

        {/* Image Sizing Example */}
        <section className=\"bg-white rounded-lg shadow-md p-6\">
          <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Image Sizing Example</h2>
          <div className=\"flex items-center gap-4\">
            <div className=\"w-16 h-16 lg:w-24 lg:h-24 laptop:w-20 laptop:h-20 xl:w-28 xl:h-28 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold\">
              IMG
            </div>
            <p className=\"text-gray-600\">
              Avatar size: 16 (base) → 24 (lg) → 20 (laptop) → 28 (xl)
            </p>
          </div>
        </section>

        {/* Laptop-Only Styling Example */}
        <section className=\"bg-white rounded-lg shadow-md p-6\">
          <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Laptop-Only Styling Example</h2>
          <div className=\"p-4 rounded laptop:max-xl:bg-yellow-100 laptop:max-xl:border-2 laptop:max-xl:border-yellow-400\">
            <p className=\"text-gray-700\">
              This box has a yellow background and border ONLY on laptop screens (1366px-1535px).
              It uses the laptop:max-xl: prefix to target that specific range.
            </p>
          </div>
        </section>

        {/* Button Sizing Example */}
        <section className=\"bg-white rounded-lg shadow-md p-6\">
          <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Button Sizing Example</h2>
          <div className=\"flex gap-4\">
            <button className=\"px-4 py-2 lg:px-6 lg:py-3 laptop:px-5 laptop:py-2 xl:px-8 xl:py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition\">
              Responsive Button
            </button>
            <button className=\"px-4 py-2 lg:px-6 lg:py-3 laptop:px-5 laptop:py-2 xl:px-8 xl:py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition\">
              Another Button
            </button>
          </div>
        </section>

        {/* Gap Spacing Example */}
        <section className=\"bg-white rounded-lg shadow-md p-6\">
          <h2 className=\"text-xl font-bold mb-4 text-gray-800\">Gap Spacing Example</h2>
          <div className=\"flex gap-2 lg:gap-6 laptop:gap-4 xl:gap-8\">
            <div className=\"w-20 h-20 bg-blue-500 rounded\"></div>
            <div className=\"w-20 h-20 bg-blue-500 rounded\"></div>
            <div className=\"w-20 h-20 bg-blue-500 rounded\"></div>
          </div>
          <p className=\"mt-4 text-sm text-gray-600\">
            Gap: 2 (base) → 6 (lg) → 4 (laptop) → 8 (xl)
          </p>
        </section>

        {/* Breakpoint Info Display */}
        <section className=\"bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-md p-6 text-white\">
          <h2 className=\"text-xl font-bold mb-4\">Current Breakpoint</h2>
          <div className=\"text-sm space-y-2\">
            <div className=\"block xs:hidden\">Base (< 475px)</div>
            <div className=\"hidden xs:block sm:hidden\">xs (475px - 639px)</div>
            <div className=\"hidden sm:block md:hidden\">sm (640px - 767px)</div>
            <div className=\"hidden md:block lg:hidden\">md (768px - 1023px)</div>
            <div className=\"hidden lg:block laptop:hidden\">lg (1024px - 1365px)</div>
            <div className=\"hidden laptop:block xl:hidden\">✨ laptop (1366px - 1535px) ✨</div>
            <div className=\"hidden xl:block 2xl:hidden\">xl (1536px+)</div>
            <div className=\"hidden 2xl:block\">2xl (1536px+)</div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LaptopBreakpointExample;
