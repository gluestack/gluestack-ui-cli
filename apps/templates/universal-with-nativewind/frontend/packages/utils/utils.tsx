import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

export const handleImageResult = async (result: any, setImage: any) => {
  if (result.canceled || !result.assets || result.assets.length === 0) {
    console.log('User cancelled image picker.');
    return;
  }
  const image = result.assets[0];
  setImage(image.uri);
};

export const pickImage = async (setImage: any) => {
  const image = await launchImageLibraryAsync({
    mediaTypes: MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
    base64: true,
  });

  handleImageResult(image, setImage);
};

export const transformProductPlanData = (
  data:
    | {
        id: any;
        active: any;
        description: any;
        unit_amount: any;
        currency: any;
        type: any;
        interval: any;
        product: {
          name: any;
          image: any;
          description: any;
        }[];
      }[]
    | null
): {
  id: any;
  active: any;
  description: any;
  unit_amount: any;
  currency: any;
  type: any;
  interval: any;
  product: {
    name: any;
    image: any;
    description: any;
  } | null;
}[] => {
  if (data)
    return data.map((item: any) => ({
      ...item,
      unit_amount: item.unit_amount / 100,
    }));
  else {
    return [];
  }
};

export const getSubscriptionIntervals = (transformedData: any) => {
  const distinctIntervals = [
    // @ts-ignore
    ...new Set(transformedData.map((item) => item.interval)),
  ] as any[];
  distinctIntervals.sort((a, b) => a!.localeCompare(b!));

  const formattedIntervals = distinctIntervals.map((interval, index) => ({
    id: index + 1,
    interval_title: 'per ' + interval,
    interval_type: interval,
  }));
  return formattedIntervals;
};
