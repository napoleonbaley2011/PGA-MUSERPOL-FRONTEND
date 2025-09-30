import { useDispatch, useSelector } from "react-redux";
import { coffeApi } from "../services"
import { setReportKardex, setReportValued, setReportValuedConsolid, setManagement } from "../store";
import { printDocument, downloadDocument } from "../utils/helper";
import Swal from "sweetalert2";

const api = coffeApi;

export const useReportKardexStore = () => {
    const { report_ValuedPhys, report_kardexs = [], report_ValuedPhy_Consolids, managements, flag } = useSelector((state: any) => state.report_kardexs);
    const dispatch = useDispatch();

    const getReportKardex = async (material_id: any, startDate: string | null, endDate: string | null) => {
        const queryParams = new URLSearchParams({
            start_date: startDate || '',
            end_date: endDate || ''
        });
        const { data } = await api.get(`/auth/ReportPrintKardex/${material_id}?${queryParams}`);
        dispatch(setReportKardex({ report_kardexs: data }))
        return true;
    }

    const PrintReportKardex = async (material_id: any, startDate: string | null, endDate: string | null) => {
        try {
            const queryParams = new URLSearchParams({
                start_date: startDate || '',
                end_date: endDate || ''
            });

            const response = await api.get(`/auth/PrintKardex/${material_id}?${queryParams}`, {
                responseType: 'arraybuffer',
            });
            printDocument(response)
            return true

        } catch (error) {
            console.error('Error al imprimir la nota de entrada:', error);
        }
    };
    const DownloadReportKardex = async (material_id: any, startDate: string | null, endDate: string | null) => {
        try {
            const queryParams = new URLSearchParams({
                start_date: startDate || '',
                end_date: endDate || ''
            });
            const response = await api.get(`/auth/PrintKardex/${material_id}?${queryParams}`, {
                responseType: 'arraybuffer',
            });
            downloadDocument(response, `report_kardex_${endDate}.pdf`);
            return true;
        } catch (error) {
            console.error('Error al descargar el kardex:', error);
        }
    };

    const DownloadReportKardexExcel = async (material_id: any, startDate: string | null, endDate: string | null) => {
        try {
            const queryParams = new URLSearchParams({
                start_date: startDate || '',
                end_date: endDate || ''
            });

            const response = await api.get(`/auth/PrintKardexExcel/${material_id}?${queryParams}`, {
                responseType: 'arraybuffer',
            });

            downloadDocument(response, `report_kardex_${endDate}.xlsx`);
            return true;
        } catch (error) {
            console.error('Error al descargar el Kardex en Excel:', error);
        }
    };

    const getReportValued = async (startDate?: string, endDate?: string) => {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };
        const { data } = await api.get('/auth/ReportPrintValuedPhysical/', { params });
        dispatch(setReportValued({ report_ValuedPhys: data }));
        return true;
    };

    const PrintReportValued = async (startDate?: string, endDate?: string) => {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };

        try {
            const response = await api.get('/auth/PrintValuedPhysical/', {
                params,
                responseType: 'arraybuffer',
            });
            printDocument(response);

            return true;
        } catch (error) {
            console.error('Error al imprimir el informe:', error);
            return false;
        }
    };
    const DownloadReportValued = async (startDate?: string, endDate?: string) => {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };

        try {
            const response = await api.get('/auth/PrintValuedPhysical/', {
                params,
                responseType: 'arraybuffer',
            });
            downloadDocument(response, 'Inventario_Fisico_Valorado.pdf');

            return true;
        } catch (error) {
            console.error('Error al descargar el kardex:', error);
            return false;
        }
    };

    const DownloadReportValuedExcel = async (startDate?: string, endDate?: string) => {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };

        try {
            const response = await api.get('/auth/PrintValuedPhysicalExcel/', {
                params,
                responseType: 'arraybuffer',
            });
            downloadDocument(response, `report_kardex_${endDate}.xlsx`);

            return true;
        } catch (error) {
            console.error('Error al descargar el kardex:', error);
            return false;
        }
    };

    const getReportValuedConsolid = async (startDate?: string, endDate?: string) => {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };
        const { data } = await api.get(`/auth/ValuedPhysicalConsolidatedModificaded/`, { params });
        dispatch(setReportValuedConsolid({ report_ValuedPhy_Consolids: data }));
        return true;
    }


    const PrintReportConsolidatedInventory = async (startDate?: string, endDate?: string) => {
        try {
            const params = {
                start_date: startDate,
                end_date: endDate,
            };

            const response = await api.get(`/auth/PrintValuedPhysicalConsolidated/`, {
                params,
                responseType: 'arraybuffer',
            });
            printDocument(response);

            return true;
        } catch (error) {
            console.error('Error al imprimir el informe:', error);
            return false;
        }
    };

    const DownloadReportConsolidatedInventory = async (startDate?: string, endDate?: string) => {

        try {
            const params = {
                start_date: startDate,
                end_date: endDate,
            };
            const response = await api.get(`/auth/PrintValuedPhysicalConsolidated/`, {
                params,
                responseType: 'arraybuffer',
            });
            downloadDocument(response, 'Inventario_Fisico_Valorado_Consolidado.pdf');

            return true;
        } catch (error) {
            console.error('Error al descargar el kardex:', error);
            return false;
        }
    };

    const DownloadReportConsolidatedInventoryExcel = async (startDate?: string, endDate?: string) => {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };

        try {
            const response = await api.get('/auth/ReportConsolidatedExcel/', {
                params,
                responseType: 'arraybuffer',
            });
            downloadDocument(response, `report_kardex_${endDate}.xlsx`);

            return true;
        } catch (error) {
            console.error('Error al descargar el kardex:', error);
            return false;
        }
    };

    const ClosureMagementStore = async () => {
        try {
            const { data } = await api.get('/auth/ManagementClosure');
            if (data.error) {
                Swal.fire('Error', data.error, 'warning');
            } else {
                Swal.fire('Cierre de Gestion Realizado!!!', '', 'success');
            }

            return data;
        } catch (error) {
            console.error('Error al cerrar la gestión', error);
            Swal.fire('Error', 'Existen Solicitudes ', 'error');
            return false;
        }
    }

    const listManagement = async () => {
        const { data } = await api.get('/auth/listManagement');
        dispatch(setManagement({ managements: data }));
        return data;
    }



    return {
        report_kardexs,
        flag,
        report_ValuedPhys,
        report_ValuedPhy_Consolids,
        managements,

        getReportKardex,
        getReportValued,
        PrintReportKardex,
        DownloadReportKardex,
        DownloadReportKardexExcel,
        PrintReportValued,
        DownloadReportValued,
        DownloadReportValuedExcel,
        getReportValuedConsolid,
        PrintReportConsolidatedInventory,
        DownloadReportConsolidatedInventory,
        DownloadReportConsolidatedInventoryExcel,
        ClosureMagementStore,
        listManagement,
    }
}