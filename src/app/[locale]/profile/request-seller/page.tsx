'use client';

import { useState } from 'react';
import { useSellerRequest } from '@/hooks/useSellerRequest';
import { useTranslations } from 'next-intl';

export default function RequestSellerPage() {
  const { submitRequest, loading, error } = useSellerRequest();
  const [companyName, setCompanyName] = useState<string>('');
  const [businessAddress, setBusinessAddress] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [website] = useState<string>('');
  const [nif, setNif] = useState<string>('');
  const [businessDescription, setBusinessDescription] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const t = useTranslations('RequestSellerPage');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('businessAddress', businessAddress);
    formData.append('phoneNumber', phoneNumber);
    formData.append('website', website || '');
    formData.append('nif', nif);
    formData.append('businessDescription', businessDescription);

    if (pdfFile) {
      formData.append('pdfFile', pdfFile);
    }

    await submitRequest(formData);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">
          {t('requestSellerTitle')}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <div className="mb-4">
            <label htmlFor="companyName" className="block text-sm font-medium mb-2">
              {t('companyNameLabel')}
            </label>
            <input
              id="companyName"
              type="text"
              className="input input-bordered w-full"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="nif" className="block text-sm font-medium mb-2">
              {t('nifLabel')}
            </label>
            <input
              id="nif"
              type="text"
              className="input input-bordered w-full"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="businessAddress" className="block text-sm font-medium mb-2">
              {t('businessAddressLabel')}
            </label>
            <input
              id="businessAddress"
              type="text"
              className="input input-bordered w-full"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
              {t('phoneNumberLabel')}
            </label>
            <input
              id="phoneNumber"
              type="text"
              className="input input-bordered w-full"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="businessDescription" className="block text-sm font-medium mb-2">
              {t('businessDescriptionLabel')}
            </label>
            <textarea
              id="businessDescription"
              className="textarea textarea-bordered w-full h-24"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="pdfFile" className="block text-sm font-medium mb-2">
              {t('pdfFileLabel')}
            </label>
            <input
              id="pdfFile"
              type="file"
              accept=".pdf"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? t('sending') : t('submitRequestButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
