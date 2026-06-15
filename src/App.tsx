/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SkyHopGame from './components/SkyHopGame';

export default function App() {
  return (
    <main className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
      <SkyHopGame />
    </main>
  );
}

