import { createSearchParams } from 'nuqs';

export const [searchParams, setSearchParams, getParam] = createSearchParams({
  // Default options
  shallow: false, // useRouter.replace instead of push
  window: typeof window !== 'undefined' ? window : undefined,
});
