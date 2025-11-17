import { createSlice } from "@reduxjs/toolkit";

export const note_petty_cashSlice = createSlice({
    name: 'note_petty_cash',
    initialState: {
        note_petty_cashes: [] as any[],
        types_cancellations: [] as any[],
        flag: false,
    },
    reducers: {
        setNotePettyCash: (state, action) => {
            state.note_petty_cashes = action.payload.note_petty_cashes;
        },
        setTypeCancellations: (state, action) => {
            state.types_cancellations = action.payload.types_cancellations;
        },
        refreshNotePettyCash: (state) => {
            state.flag = !state.flag
        }
    },
});

export const {setNotePettyCash, setTypeCancellations, refreshNotePettyCash } = note_petty_cashSlice.actions;