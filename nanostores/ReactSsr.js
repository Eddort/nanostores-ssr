import {
  createContext,
  useState,
  useLayoutEffect,
  useEffect,
  useContext,
} from "react";

const isServer = typeof window === "undefined";

const useIsomorphicLayoutEffect = isServer ? () => {} : useEffect;

export const Context = createContext();

export function useStore(store, opts = {}) {
  let [, forceRender] = useState({});

  const instances = useContext(Context);

  if (process.env.NODE_ENV !== "production") {
    if (typeof store === "function") {
      throw new Error(
        "Use useStore(Template(id)) or useSync() " +
          "from @logux/client/react for templates"
      );
    }
  }

  useIsomorphicLayoutEffect(() => {
    let rerender = () => {
      forceRender({});
    };

    if (opts.keys) {
      return listenKeys(store, opts.keys, rerender);
    } else {
      return store.listen(rerender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, "" + opts.keys]);

  if (isServer && instances && store.instanceId) {
    return instances[store.instanceId];
  }

  return store.get();
}
