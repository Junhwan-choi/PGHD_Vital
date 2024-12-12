import { atom } from 'recoil';

export const preprocessStatusState = atom<string>({
    key: 'preprocessStatus',
    default: '',
});

export const filecreatetimeSave = atom<string>({
    key: 'filecreatetime',
    default: '',
});
export const brandSave = atom<string>({
    key: 'brand',
    default: '',
});
export const filetypesave = atom<string>({
    key: 'filetypesave',
    default: '',
});
export const savelastdata = atom<any[]>({
    key: 'savelastdata',
    default: [],
});
export const saverowlastdata = atom<any[]>({
    key: 'saverowlastdata',
    default: [],
});
export const saveemail = atom<string>({
    key: 'saveemail',
    default: localStorage.getItem('saveemail') || '', // 로컬 스토리지에서 초기값 가져오기
});

export const tokenSave = atom<string>({
    key: 'token',
    default: localStorage.getItem('token') || '', // 로컬 스토리지에서 초기값 가져오기
});