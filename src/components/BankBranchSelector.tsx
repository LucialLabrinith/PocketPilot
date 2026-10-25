import React, { useState, useMemo } from 'react';
import {
  COUNTRY_BANK_CATALOG,
  CountryBankingInfo,
  BankInfo,
  BankBranch,
  getCountryBanking,
  getStatesForCountry,
  getCitiesForState,
  getBanksForLocation,
  getBranchesForLocation,
  searchBranches,
  lookupIfsc,
  detectBankFromIfsc
} from '../data/bankCatalog';
import {
  Building2,
  MapPin,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  ExternalLink,
  Landmark,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BankBranchSelectorProps {
  initialCountry?: string;
  initialState?: string;
  initialCity?: string;
  initialBankId?: string;
  initialIfsc?: string;
  onSelect: (selected: {
    bank: BankInfo;
    branch: BankBranch;
    country: CountryBankingInfo;
  }) => void;
  className?: string;
  compact?: boolean;
}

export const BankBranchSelector: React.FC<BankBranchSelectorProps> = ({
  initialCountry = 'IN',
  initialState,
  initialCity,
  initialBankId,
  initialIfsc,
  onSelect,
  className = '',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'HIERARCHY' | 'SEARCH' | 'DIRECTORY'>('HIERARCHY');

  // Hierarchy selections
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountry);
  const activeCountry = useMemo(() => getCountryBanking(selectedCountryCode), [selectedCountryCode]);

  const availableStates = useMemo(() => getStatesForCountry(selectedCountryCode), [selectedCountryCode]);

  const [selectedState, setSelectedState] = useState<string>(() => {
    if (initialState && availableStates.includes(initialState)) return initialState;
    return availableStates[0] || 'Maharashtra';
  });

  const availableCities = useMemo(() => {
    return getCitiesForState(selectedCountryCode, selectedState);
  }, [selectedCountryCode, selectedState]);

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (initialCity && availableCities.includes(initialCity)) return initialCity;
    return availableCities[0] || 'Mumbai';
  });

  // Banks present in selected state + city
  const availableBanks = useMemo(() => {
    return getBanksForLocation(selectedCountryCode, selectedState, selectedCity);
  }, [selectedCountryCode, selectedState, selectedCity]);

  const [selectedBankId, setSelectedBankId] = useState<string>(() => {
    if (initialBankId && availableBanks.some(b => b.id === initialBankId)) return initialBankId;
    return availableBanks[0]?.id || 'sbi';
  });

  // Branches in selected city for selected bank
  const availableBranches = useMemo(() => {
    return getBranchesForLocation(selectedCountryCode, selectedState, selectedCity, selectedBankId);
  }, [selectedCountryCode, selectedState, selectedCity, selectedBankId]);

  const [selectedBranchCode, setSelectedBranchCode] = useState<string>(() => {
    if (initialIfsc) return initialIfsc;
    return availableBranches[0]?.code || '';
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchBranches(searchQuery.trim(), selectedCountryCode);
  }, [searchQuery, selectedCountryCode]);

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const newStates = getStatesForCountry(code);
    const firstState = newStates[0] || '';
    setSelectedState(firstState);

    const newCities = getCitiesForState(code, firstState);
    const firstCity = newCities[0] || '';
    setSelectedCity(firstCity);

    const newBanks = getBanksForLocation(code, firstState, firstCity);
    const firstBank = newBanks[0]?.id || '';
    setSelectedBankId(firstBank);

    const newBranches = getBranchesForLocation(code, firstState, firstCity, firstBank);
    setSelectedBranchCode(newBranches[0]?.code || '');
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const newCities = getCitiesForState(selectedCountryCode, stateName);
    const firstCity = newCities[0] || '';
    setSelectedCity(firstCity);

    const newBanks = getBanksForLocation(selectedCountryCode, stateName, firstCity);
    const firstBank = newBanks[0]?.id || '';
    setSelectedBankId(firstBank);

    const newBranches = getBranchesForLocation(selectedCountryCode, stateName, firstCity, firstBank);
    const firstBranch = newBranches[0];
    setSelectedBranchCode(firstBranch?.code || '');

    if (firstBranch) {
      const bankObj = activeCountry.banks.find(b => b.id === firstBank);
      if (bankObj) {
        onSelect({ bank: bankObj, branch: firstBranch, country: activeCountry });
      }
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const newBanks = getBanksForLocation(selectedCountryCode, selectedState, cityName);
    const firstBank = newBanks[0]?.id || '';
    setSelectedBankId(firstBank);

    const newBranches = getBranchesForLocation(selectedCountryCode, selectedState, cityName, firstBank);
    const firstBranch = newBranches[0];
    setSelectedBranchCode(firstBranch?.code || '');

    if (firstBranch) {
      const bankObj = activeCountry.banks.find(b => b.id === firstBank);
      if (bankObj) {
        onSelect({ bank: bankObj, branch: firstBranch, country: activeCountry });
      }
    }
  };

  const handleBankChange = (bankId: string) => {
    setSelectedBankId(bankId);
    const newBranches = getBranchesForLocation(selectedCountryCode, selectedState, selectedCity, bankId);
    const firstBranch = newBranches[0];
    setSelectedBranchCode(firstBranch?.code || '');

    if (firstBranch) {
      const bankObj = activeCountry.banks.find(b => b.id === bankId);
      if (bankObj) {
        onSelect({ bank: bankObj, branch: firstBranch, country: activeCountry });
      }
    }
  };

  const handleSelectBranchItem = (bank: BankInfo, branch: BankBranch) => {
    setSelectedBranchCode(branch.code);
    setSelectedBankId(bank.id);
    if (branch.state) setSelectedState(branch.state);
    if (branch.city) setSelectedCity(branch.city);
    onSelect({ bank, branch, country: activeCountry });
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden ${className}`}>
      {/* Top Banner / Mode Switcher */}
      <div className="p-3 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Bank & Real Registered IFSC Directory</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                RBI VERIFIED
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Categorized by Country, State, City & Official Registered Branch Code
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('HIERARCHY')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'HIERARCHY'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            State & City Filter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SEARCH')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'SEARCH'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Search className="w-3 h-3" />
            Quick IFSC Search
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer hidden sm:block ${
              activeTab === 'DIRECTORY'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Registered Banks ({activeCountry.banks.length})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* TAB 1: HIERARCHICAL SELECTOR (Country -> State -> City -> Bank -> Branch) */}
        {activeTab === 'HIERARCHY' && (
          <div className="space-y-4">
            {/* Country + State + City Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Country */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  1. Country
                </label>
                <select
                  value={selectedCountryCode}
                  onChange={e => handleCountryChange(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {COUNTRY_BANK_CATALOG.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. State / Region */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>2. State / Region</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                    {availableStates.length} states
                  </span>
                </label>
                <select
                  value={selectedState}
                  onChange={e => handleStateChange(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {availableStates.map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. City / District */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>3. City / District</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                    {availableCities.length} cities
                  </span>
                </label>
                <select
                  value={selectedCity}
                  onChange={e => handleCityChange(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {availableCities.map(ct => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Bank Selection in Selected Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-500" />
                  <span>4. Actual Registered Banks in {selectedCity}, {selectedState}</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {availableBanks.length} Banks Available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableBanks.map(bank => {
                  const isSelected = bank.id === selectedBankId;
                  const branchCountInCity = bank.branches.filter(
                    br => br.state.toLowerCase() === selectedState.toLowerCase() && br.city.toLowerCase() === selectedCity.toLowerCase()
                  ).length;

                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => handleBankChange(bank.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-950 dark:text-white ring-1 ring-sky-500'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs truncate flex items-center justify-between">
                        <span>{bank.shortName}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-1">
                        {bank.name}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[9px]">
                        <span className="font-mono text-slate-500">{bank.codePrefix ? `${bank.codePrefix}*` : 'SWIFT'}</span>
                        <span className="px-1.5 py-0.2 rounded font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {branchCountInCity} {branchCountInCity === 1 ? 'branch' : 'branches'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Branch List & Real Registered IFSC */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>5. Select Registered Branch & Verified {activeCountry.codeLabel}</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {availableBranches.length} {availableBranches.length === 1 ? 'branch' : 'branches'} in {selectedCity}
                </span>
              </div>

              {availableBranches.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                  No registered branches recorded for this specific bank in {selectedCity}. Please select another bank or use Quick Search.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableBranches.map(branch => {
                    const isSelected = branch.code === selectedBranchCode;
                    const bankObj = activeCountry.banks.find(b => b.id === selectedBankId);

                    return (
                      <div
                        key={branch.code}
                        onClick={() => bankObj && handleSelectBranchItem(bankObj, branch)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {branch.branchName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                              {branch.city}, {branch.state}
                            </span>
                          </div>
                          {branch.address && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {branch.address}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                            <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                              {activeCountry.codeLabel}: <strong className="text-emerald-600 dark:text-emerald-400">{branch.code}</strong>
                            </span>
                            {branch.micrCode && (
                              <span>MICR: <strong className="font-mono text-slate-500">{branch.micrCode}</strong></span>
                            )}
                            {branch.district && (
                              <span>District: <strong>{branch.district}</strong></span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(branch.code, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] flex items-center gap-1"
                            title="Copy IFSC code"
                          >
                            {copiedCode === branch.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelected ? 'Connected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INSTANT IFSC & BRANCH SEARCH */}
        {activeTab === 'SEARCH' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type registered IFSC (e.g. SBIN0000300) or branch name (Koramangala, BKC, Connaught Place)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {searchQuery.trim() === '' ? (
              <div className="p-6 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Sparkles className="w-6 h-6 text-sky-500 mx-auto" />
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Instant RBI Registered IFSC Auto-Detect
                </h5>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Type any 11-digit IFSC code or area name to immediately locate the exact registered branch, city, and state.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  {['SBIN0000300', 'HDFC0000240', 'ICIC0000004', 'UTIB0000004', 'Koramangala', 'Nariman Point'].map(sample => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setSearchQuery(sample)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-600 cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl">
                <Info className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No branches found matching "{searchQuery}"
                </p>
                <p className="text-[11px] text-slate-500">
                  Check the spelling or switch to the "State & City Filter" tab to browse by region.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="text-[11px] text-slate-400 font-medium px-1">
                  Found {searchResults.length} matching registered branches:
                </div>
                {searchResults.map(({ bank, branch }) => {
                  const isSelected = branch.code === selectedBranchCode;

                  return (
                    <div
                      key={branch.code}
                      onClick={() => handleSelectBranchItem(bank, branch)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {bank.shortName} • {branch.branchName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            {branch.city}, {branch.state}
                          </span>
                        </div>
                        {branch.address && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {branch.address}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            IFSC: {branch.code}
                          </span>
                          {branch.micrCode && (
                            <span className="font-mono text-slate-400">MICR: {branch.micrCode}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-sky-600 hover:bg-sky-500 text-white'
                        }`}
                      >
                        {isSelected ? 'Connected' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIRECTORY OF ALL REGISTERED BANKS */}
        {activeTab === 'DIRECTORY' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>All RBI Registered Institutions ({activeCountry.banks.length})</span>
              <span className="font-mono">Coverage: {activeCountry.states.length} States</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {activeCountry.banks.map(bank => {
                const totalBranches = bank.branches.length;
                const distinctStates = Array.from(new Set(bank.branches.map(b => b.state)));

                return (
                  <div
                    key={bank.id}
                    onClick={() => {
                      setSelectedBankId(bank.id);
                      setActiveTab('HIERARCHY');
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-sky-500 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {bank.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Prefix: {bank.codePrefix ? `${bank.codePrefix}0*` : 'SWIFT'} • {bank.category ? bank.category.replace('_', ' ') : 'Commercial'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {distinctStates.slice(0, 3).join(', ')}{distinctStates.length > 3 ? ` +${distinctStates.length - 3} more` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        {totalBranches} branches
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
