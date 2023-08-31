/// <reference types="vite/client" />

declare module '*.vue' {
  const component: import('vue').Component;
  export default component;
}
