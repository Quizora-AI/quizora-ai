
declare module 'react-native' {
  export * from 'react-native-web';
}

declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
}

declare module 'lucide-react' {
  import * as LucideReact from 'lucide-react';
  export * from 'lucide-react';
}

declare module 'framer-motion' {
  import * as FramerMotion from 'framer-motion';
  export * from 'framer-motion';
}

declare module 'recharts' {
  import * as Recharts from 'recharts';
  export * from 'recharts';
}

declare module 'react-router-dom' {
  import * as ReactRouterDom from 'react-router-dom';
  export * from 'react-router-dom';
}

declare module '@hookform/resolvers/zod' {
  import * as ZodResolver from '@hookform/resolvers/zod';
  export * from '@hookform/resolvers/zod';
}

declare module 'react-hook-form' {
  import * as ReactHookForm from 'react-hook-form';
  export * from 'react-hook-form';
}

declare module 'zod' {
  import * as Zod from 'zod';
  export * from 'zod';
}

declare module 'date-fns' {
  import * as DateFns from 'date-fns';
  export * from 'date-fns';
}
