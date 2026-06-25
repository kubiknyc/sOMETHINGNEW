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

/** Generate a PDF of the list and open the OS share sheet for it. */
export async function exportListPdf(list: MaterialList): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: listToHtml(list) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: list.name,
      UTI: 'com.adobe.pdf',
    });
  }
}
