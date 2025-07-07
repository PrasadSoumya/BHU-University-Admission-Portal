// src/components/ApolloWrapper.jsx
"use client"; // This component must be a Client Component

import { ApolloLink, HttpLink } from '@apollo/client';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_API_URL+"/graphql";

if (!GRAPHQL_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_GRAPHQL_API_URL is not defined in environment variables.');
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: GRAPHQL_ENDPOINT,
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            // in a SSR environment, if you use multipart features like
            // @defer, you need to decide how to send these
            // there are two cases:
            // 1. You don't use multipart features (i.e. you don't use @defer).
            //    Just use `httpLink` directly.
            // 2. You use multipart features, execute your queries on the server,
            //    and your request stream includes multipart responses.
            //    The default Next.js behavior is to terminate the request
            //    after the first chunk of a multipart response is received.
            //    This means you will only ever see the first part.
            //    You should consider using the `SSRMultipartLink` to send
            //    data back to the client as a single file.
            new SSRMultipartLink({ stripDefer: true }),
            httpLink,
          ])
        : httpLink,
  });
}

export function ApolloWrapper({ children }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}