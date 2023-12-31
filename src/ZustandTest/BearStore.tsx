import {create} from 'zustand';
import {produce} from 'immer';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {immer} from 'zustand/middleware/immer';
import {MMKVLoader} from 'react-native-mmkv-storage';
const mmkv = new MMKVLoader().initialize();
const mmkvStorage: StateStorage = {
  getItem: async (key: string) => {
    const value = mmkv.getString(key);
    return value ?? null;
  },
  setItem: async (key: string, value: string) => {
    mmkv.setString(key, value);
  },
  removeItem: async (key: string) => {
    mmkv.removeItem(key);
  },
};

type State = {
  count: number;
  arrayCount: number[];
  dataAPI: any;
  nested: {
    nestValue: {
      nestCount: number;
    };
  };
};
type Actions = {
  increment: () => void;
  incrementByNumber: (quantity: number) => void;
  fetchAPI: (data: string) => Promise<void>;
  immerFunction: () => void;
  immerZustand: () => void;
};
export const useBearStore = create<State & Actions>()(
  immer(
    persist(
      (set, get) => ({
        count: 0,
        arrayCount: [],
        dataAPI: {},
        nested: {nestValue: {nestCount: 0}},
        increment: () => set(state => ({count: state.count + 1})),
        incrementByNumber: quantity =>
          set(state => ({count: state.count + quantity})),
        fetchAPI: async (data: string) => {
          const response = await fetch(data);
          set({dataAPI: await response.json()});
        },
        immerFunction: () =>
          set(
            produce(state => {
              state.nested.nestValue.nestCount += 1;
            }),
          ),
        immerZustand: () =>
          set(state => {
            state.nested.nestValue.nestCount += 2;
          }),
      }),
      {
        name: 'bear-store',
        storage: createJSONStorage(() => mmkvStorage),
      },
    ),
  ),
);
