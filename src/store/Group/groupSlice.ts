import { createSlice } from "@reduxjs/toolkit";
import { GroupModel } from "../../models";

export const groupSlice = createSlice({
    name: 'group',
    initialState: {
        selectgroups: <GroupModel[] | null>null,
        allGroups: <GroupModel[] | null>null,
        listGroups: <any[] | null>null,
        allgroupsWithMaterial: [],
        flag: false
    },
    reducers: {
        setGroup: (state, action) => {
            state.selectgroups = action.payload.selectgroups
        },

        setAllGroup: (state, action) => {
            state.allGroups = action.payload.allGroups
        },
        setListGroup: (state, action) => {
            state.listGroups = action.payload.listGroups
        },
        setGroupMaterial: (state, action) => {
            state.allgroupsWithMaterial = action.payload.allgroupsWithMaterial
        }
    }
});

export const { setGroup, setGroupMaterial, setAllGroup, setListGroup } = groupSlice.actions;