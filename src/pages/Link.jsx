import DeviceStats from '@/components/DeviceStats';
import LocationStats from '@/components/LocationStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UrlState } from '@/Context';
import { getClicksForUrl } from '@/db/apiClicks';
import { deleteUrl, getUrl } from '@/db/apiUrls';
import UseFetch from '@/hooks/UseFetch';
import { Copy, Download, LinkIcon, Trash } from 'lucide-react';
import React, { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BarLoader, BeatLoader } from 'react-spinners';

const Link = () => {

  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title;

    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;

    // Append the anchor to the body
    document.body.appendChild(anchor);

    // Trigger the download by simulating a click event
    anchor.click();

    // Remove the anchor from the document
    document.body.removeChild(anchor);
  };

  const {id} = useParams();
  const {user} = UrlState();
  const navigate = useNavigate();

  const {
    loading,
    data: url,
    fn,
    error,
  } = UseFetch(getUrl, {id, user_id: user?.id});

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = UseFetch(getClicksForUrl, id);

  const {loading: loadingDelete, fn: fnDelete} = UseFetch(deleteUrl, id);

  useEffect(() => {
    fn();
    fnStats();
  }, []);

  if(error) {
    navigate("/dashboard")
  }

   let link = "";
  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url;
  }



  return <>
   {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className=" flex flex-col gap-8 sm:flex-row justify-between px-32">
        <div className=" flex flex-col items-start gap-8 rounded-lg sm:w-2/5">
          <span className=" text-6xl font-extrabold hover:underline cursor-pointer">{url?.title}</span>
           <a
            href={`https://anish.in/${link}`}
            target="_blank"
            className=" text-2xl sm:text-4xl text-blue-400 font-bold hover:underline cursor-pointer"
          >
            https://anish.in/{link}
          </a>
            <a
            href={url?.original_url}
            target="_blank"
            className=" flex items-center gap-1 hover:underline cursor-pointer"
          >
            <LinkIcon className="p-1" />
            {url?.original_url}
          </a>
          <span className=" flex items-end font-extralight text-sm px-4">
            {new Date(url?.created_at).toLocaleString()}
          </span>
           <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                navigator.clipboard.writeText(`https://anish.in/${link}`)
              }
            >
              <Copy />
            </Button>
            <Button variant="ghost" onClick={downloadImage}>
              <Download />
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                fnDelete().then(() => {
                  navigate("/dashboard");
                })
              }
              disable={loadingDelete}
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash />
              )}
            </Button>
          </div>
            <img
            src={url?.qr}
            className="w-full self-center sm:self-start ring ring-blue-500 p-1 object-contain"
            alt="qr code"
          />
        </div>

        <Card className="sm:w-3/5">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold">Stats</CardTitle>
          </CardHeader>
          {stats && stats.length ? (
            <CardContent className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle>Location Data</CardTitle>
              { <LocationStats stats={stats} />}
              <CardTitle>Device Info</CardTitle>
              { <DeviceStats stats={stats} />}
            </CardContent>
          ) : (
            <CardContent>
              {loadingStats === false
                ? "No Statistics yet"
                : "Loading Statistics.."}
            </CardContent>
          )}
        </Card>
      </div>
  </>
  
};

export default Link;
