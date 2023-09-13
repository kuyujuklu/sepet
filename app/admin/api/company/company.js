"use client"

import { createApi } from '@reduxjs/toolkit/query/react';
import { authenticationBasedQuery } from '../auth/authBasedQuery';

export const company = createApi({
    reducerPath: 'companyQuery',
    baseQuery: authenticationBasedQuery,
    tagTypes: ['Company'],
    endpoints: (builder) => ({
        getCompany: builder.query({
            query: () => `/api/company/`,
            providesTags: ['Company']
        }),
    }),
    
})

export const { useGetCompanyQuery } = company;