export interface Music {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  cover: string;
  lyrics: string;
}

export interface LyricLine {
  time: number;
  text: string;
}