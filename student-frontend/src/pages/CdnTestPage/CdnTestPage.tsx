/**
 * CDN Test Page Component
 * 
 * A simple test page t          <div className="space-y-2 text-sm">
            <div><strong>Logo:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.logo}</code></div>
            <div><strong>Course Banner:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.courseBanner}</code></div>
            <div><strong>Profile Picture:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.profilePic}</code></div>
            <div><strong>Vector Image:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.vectorImage}</code></div>
          </div>fy Bunny CDN image functionality
 */

import React from 'react';
import { OptimizedImage, ProfilePicture } from '@/components/common/OptimizedImage';
import { CDN_IMAGES } from '@/constants/images';
import { getCDNImageUrl, getImageEnvironmentConfig } from '@/utils/imageUtils';

const CdnTestPage: React.FC = () => {
  // Get environment config for debugging
  const envConfig = getImageEnvironmentConfig();
  const viteEnv = React.useMemo(() => {
    return {
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV,
      VITE_BUNNY_CDN_ENABLED: import.meta.env.VITE_BUNNY_CDN_ENABLED,
      VITE_BUNNY_CDN_BASE_URL: import.meta.env.VITE_BUNNY_CDN_BASE_URL,
    };
  }, []);

  // Test URL generation
  const testUrls = {
    logo: getCDNImageUrl('orbed_logo.svg', { width: 200 }),
    courseBanner: getCDNImageUrl('course_details_banner.png', { width: 600, height: 300, format: 'webp' }),
    profilePic: getCDNImageUrl('default_profile_picture.webp', { width: 120, height: 120 }),
    vectorImage: getCDNImageUrl('signin_vector.png', { width: 400, height: 300, quality: 85 }),
  };

  // Log for debugging
  console.log('Environment Config:', envConfig);
  console.log('Vite Environment:', viteEnv);
  console.log('Generated URLs:', testUrls);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Bunny CDN Image Test Page
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">CDN Configuration</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <p><strong>CDN URL:</strong> https://lmsbunny.b-cdn.net/</p>
            <p><strong>Environment:</strong> {viteEnv.MODE}</p>
            <p><strong>Is Production:</strong> {String(viteEnv.PROD)}</p>
            <p><strong>Is Development:</strong> {String(viteEnv.DEV)}</p>
            <p><strong>CDN Enabled (computed):</strong> {String(envConfig.useCDN)}</p>
            <p><strong>CDN Base URL (computed):</strong> {envConfig.cdnBaseUrl}</p>
            <p><strong>Local Base Path:</strong> {envConfig.localBasePath}</p>
            <p><strong>CDN Enabled (env var):</strong> {viteEnv.VITE_BUNNY_CDN_ENABLED}</p>
            <p><strong>CDN Base URL (env var):</strong> {viteEnv.VITE_BUNNY_CDN_BASE_URL}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generated URLs</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Logo:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.logo}</code></div>
            <div><strong>Course Banner:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.courseBanner}</code></div>
            <div><strong>Profile Picture:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.profilePic}</code></div>
            <div><strong>Vector Image:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{testUrls.vectorImage}</code></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Image Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Test */}
            <div>
              <h3 className="font-medium mb-2">Logo (SVG)</h3>
              <OptimizedImage
                src={CDN_IMAGES.brand.logo}
                alt="Orbed Logo"
                width={200}
                height={60}
                className="border border-gray-200 rounded"
                showLoadingSkeleton={true}
              />
            </div>

            {/* Profile Picture Test */}
            <div>
              <h3 className="font-medium mb-2">Profile Picture</h3>
              <ProfilePicture
                src={CDN_IMAGES.profile.default}
                alt="Default Profile"
                size={120}
              />
            </div>

            {/* Hero Image Test */}
            <div className="md:col-span-2">
              <h3 className="font-medium mb-2">Hero Image (Large)</h3>
              <OptimizedImage
                src={CDN_IMAGES.ui.heroImage}
                alt="Hero Image"
                width={800}
                height={400}
                className="w-full max-w-2xl border border-gray-200 rounded-lg"
                optimization={{
                  quality: 85,
                  format: 'webp'
                }}
                showLoadingSkeleton={true}
              />
            </div>

            {/* Responsive Test */}
            <div className="md:col-span-2">
              <h3 className="font-medium mb-2">Responsive Image</h3>
              <OptimizedImage
                src={CDN_IMAGES.course.banner}
                alt="Course Banner"
                className="w-full border border-gray-200 rounded-lg"
                responsive={{
                  base: { width: 800, height: 400 },
                  breakpoints: [
                    { mediaQuery: '(max-width: 768px)', width: 600, height: 300 },
                    { mediaQuery: '(max-width: 480px)', width: 400, height: 200 },
                  ],
                  sizes: '(max-width: 768px) 600px, (max-width: 480px) 400px, 800px'
                }}
                optimization={{
                  quality: 80,
                  format: 'webp'
                }}
                showLoadingSkeleton={true}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="text-sm text-gray-600">
            <p>✅ Check browser Network tab to see if images load from CDN or local fallback</p>
            <p>✅ Images should show loading skeletons first</p>
            <p>✅ Failed images should show error states with retry options</p>
            <p>✅ Right-click images to inspect src URLs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CdnTestPage;
