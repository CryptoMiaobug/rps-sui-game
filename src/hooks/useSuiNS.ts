import { useSuiClient } from '@mysten/dapp-kit';
import { useCallback, useRef } from 'react';

const SUINS_REGISTRY = '0x6e0ddefc0ad98889c04bab9639e512c21766c5e6366f89e696956d9be6952871';

export function useSuiNS() {
  const client = useSuiClient();
  const cache = useRef(new Map<string, string | null>());

  const resolveName = useCallback(async (address: string): Promise<string | null> => {
    if (cache.current.has(address)) return cache.current.get(address) || null;
    try {
      // Query SuiNS reverse registry
      const result = await client.getDynamicFieldObject({
        parentId: SUINS_REGISTRY,
        name: { type: 'address', value: address },
      });
      if (result.data?.content) {
        const fields = (result.data.content as any).fields;
        const name = fields?.value || fields?.name || null;
        cache.current.set(address, name);
        return name;
      }
    } catch {
      // No SuiNS name
    }
    cache.current.set(address, null);
    return null;
  }, [client]);

  const resolveNames = useCallback(async (addresses: string[]): Promise<Map<string, string>> => {
    const nameMap = new Map<string, string>();
    await Promise.allSettled(
      addresses.map(async (addr) => {
        const name = await resolveName(addr);
        if (name) nameMap.set(addr, name);
      })
    );
    return nameMap;
  }, [resolveName]);

  return { resolveName, resolveNames };
}
