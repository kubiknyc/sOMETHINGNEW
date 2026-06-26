import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { listToHtml, listToText } from './format';
import type { MaterialList } from './types';

export { listToHtml, listToText } from './format';

/** Share the list as plain text via the OS share sheet. */
export async function shareList(list: MaterialList): Promise<void> {
  await Share.share({
    title: list.name,
    message: listToText(list),
  });
}

/**
 * Generate a PDF of the list and open the OS share sheet for it.
 * Throws if PDF generation fails or sharing isn't available on the device, so
 * the caller can surface the error to the user.
 */
export async function exportListPdf(list: MaterialList): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  const { uri } = await Print.printToFileAsync({ html: listToHtml(list) });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: list.name,
    UTI: 'com.adobe.pdf',
  });
}
