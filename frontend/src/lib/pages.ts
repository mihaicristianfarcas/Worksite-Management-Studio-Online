// import { lazy, ReactElement } from 'react';

// // Map section names to their corresponding page components
// const pageMapping: Record<string, () => Promise<any>> = {
//   Home: () => import('@/pages/Home'),
//   Projects: () => import('@/pages/Projects'),
//   Settings: () => import('@/pages/Settings'),
//   Workers: () => import('@/pages/Workers'),
//   Worksites: () => import('@/pages/Worksites'),
//   Calendar: () => import('@/pages/Calendar'),
// };

// // Get the dynamically loaded component for the requested section
// export function GetActivePage({ section }: { section: string }) {
//   const importPage = pageMapping[section];
  
//   if (!importPage) {
//     console.error(`No page found for section: ${section}`);
//   }
  
//   try {
//     return <importPage />;
//   } catch (error) {
//     console.error('Error loading page:', error);
//   }
// }

// // Component to render the appropriate page with suspense
// export default function LoadPage({ section }: { section: string }): ReactElement {
//   const PageComponent = GetActivePage({ section });
  
//   return <PageComponent/>
// }