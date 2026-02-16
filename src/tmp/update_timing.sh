#!/bin/bash
# Script to update timing functions
sed -i "s/cubic-bezier(0\.4, 0, 1, 1)/cubic-bezier(0.65, 0, 0.35, 1)/g" /components/PricingPage.tsx
sed -i "s/cubic-bezier(0\.4, 0, 1, 1)/cubic-bezier(0.65, 0, 0.35, 1)/g" /components/PartnersPage.tsx
