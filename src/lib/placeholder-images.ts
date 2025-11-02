import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type ProfilePicture = {
  id: string;
  imageUrl: string;
}

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
export const ProfilePictures: ProfilePicture[] = data.profilePictures;
