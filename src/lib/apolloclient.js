// src/lib/apollo-client.js
// This file will be used for Server Components
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'; // rsc for "React Server Components"

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;

if (!GRAPHQL_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_GRAPHQL_API_URL is not defined in environment variables.');
}

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: GRAPHQL_ENDPOINT,
      // You might need to add `fetchOptions` if you have specific headers, etc.
      // fetchOptions: { cache: 'no-store' }, // Example for not caching fetch requests
    }),
  });
});