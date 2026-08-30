"use client";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetPubQuery } from "@/api/pub/pub";
import { useGetPubMenuTreeQuery } from "@/api/dish/dish";
import { selectCompanyID } from "../../company/companySlice";
import { selectPubID } from "../pubSlice";
import { buildPromoDishes, hasDiscount, isHit } from "./promoCategory";

// Everything the virtual "discounts & hits" category is made of, in one place
// so the card that shows the count and the page that lists the dishes can
// never disagree about what is in it.
//
// Both queries are shared RTK Query cache entries - the pub is already loaded
// by the page around this - so mounting the card costs one request, and the
// page that opens from it costs none.
export const usePromoDishes = () => {
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);

    const { data: pubData } = useGetPubQuery(
        { companyID, pubID },
        { skip: !companyID || !pubID }
    );

    const pubUrlName = pubData?.pub?.url_name;

    const {
        data: pubTree,
        isLoading,
        error,
    } = useGetPubMenuTreeQuery({ pubUrlName }, { skip: !pubUrlName });

    return useMemo(() => {
        const promoDishes = buildPromoDishes(pubTree);

        return {
            promoDishes,
            isLoading,
            error,
            discountsCount: promoDishes.filter((entry) => hasDiscount(entry.dish))
                .length,
            hitsCount: promoDishes.filter((entry) => isHit(entry.dish)).length,
        };
    }, [pubTree, isLoading, error]);
};
