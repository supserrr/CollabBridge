import { AuroraBackground } from "@/components/ui/aurora-background";

// Example usage for profile background
export function ProfileWithAuroraBackground() {
  return (
    <AuroraBackground>
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold dark:text-white">
          Your Profile
        </h1>
        <p className="text-base md:text-lg dark:text-neutral-200 max-w-lg mx-auto">
          Welcome to your professional profile with a beautiful aurora background
        </p>
        
        {/* Your profile content here */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-md w-full">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto" />
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-600 dark:text-gray-300">Professional Service Provider</p>
            <div className="flex justify-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                Photography
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                Events
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}

// Smaller usage for profile header/banner section
export function ProfileBannerWithAurora({ children }: { children: React.ReactNode }) {
  return (
    <AuroraBackground 
      className="h-[40vh] md:h-[50vh]" 
      showRadialGradient={false}
    >
      {children}
    </AuroraBackground>
  );
}
