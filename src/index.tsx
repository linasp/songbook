import './globals.css';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { SongsIndex, SongPage } from './App';
import { loadSongs, loadSongById } from './data';

const router = createHashRouter([
  {
    path: '/',
    // errorElement: <ErrorPage />,
    element: <SongsIndex />,
    loader: loadSongs,
  },
  {
    path: 'songs/:songId',
    element: <SongPage />,
    loader: loadSongById,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<RouterProvider router={router} />);
