import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import app from '../firebaseConfig';
import { Avatar, Button, Card, IconButton } from 'react-native-paper';
import Comments from './Comments';
import ReactTimeAgo, { useTimeAgo } from 'react-time-ago';
// import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const db = getFirestore(app);

const FormatDate = ({ date }) => {
  console.log(date);

  const result = useTimeAgo({ date: new Date(), locale: 'en-US' });
  return <Text>{result}</Text>
}

const FeedCard = ({ data, feedList, setFeedList, index }) => {

  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);

  const likePost = async () => {

    const ref = doc(db, 'socialpost', data.id);
    await setDoc(ref,
      { likes: (data.likes ? data.likes : 0) + (liked ? -1 : 1) },
      { merge: true });

    const updateData = (await getDoc(ref)).data();

    const temp = feedList;
    temp[index] = { ...data, likes: updateData.likes };
    setFeedList([...temp]);
    setLiked(!liked);
  }

  return <>
    <Card key={data.id} style={styles.card}>
      <Card.Title
        title={<Text style={{ fontWeight: 'bold' }}>{data.title}</Text>}
        subtitle={new Date(data.postedOn).toLocaleDateString()}
        left={props => <Avatar.Image
          {...props}
          size={50}
          source={{ uri: data.image }}
        />}
        right={props => <IconButton {...props} icon="dots-vertical" />}
      />
      {/* <Text>{new Date(data.postedOn).toLocaleDateString()}</Text> */}
      <Card.Cover source={{ uri: data.image }} />
      <View style={styles.iconContainer}>
        <View style={styles.iconButton}>
          <IconButton
            iconColor='red'
            onPress={likePost}
            icon={liked ? "heart" : "heart-outline"}
            mode="contained" />
          <Text>{data.likes ? data.likes : "0"}</Text>
        </View>
        <View style={styles.iconButton}>
          <IconButton
            iconColor='blue'
            onPress={() => setShowComments(true)}
            icon="comment-outline"
            mode="contained" />
          <Text>{data.comments ? data.comments.length : "0"}</Text>
        </View>
        <IconButton
          icon="share"
          mode="contained" />
      </View>
    </Card>
    <Comments
      feedList={feedList}
      setFeedList={setFeedList}
      index={index}
      visible={showComments}
      setVisible={setShowComments}
      postData={data} />
  </>
}

const tabs = ['Best Posts', 'Trending', 'New', 'Latest'];

const TabList = ({ active, setActive }) => {
  return <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 20 }}>
    {tabs.map((tab) => (
      <Button
        onPress={() => setActive(tab)}
        key={tab}
        mode={active === tab ? 'contained' : 'outlined'}
      >{tab}</Button>
    ))}
  </View>
}

const Feed = () => {

  const [feedList, setFeedList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Best Posts');

  const bottomSheetRef = useRef(null);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  const loadFeed = async () => {
    const ref = collection(db, 'socialpost');
    setRefreshing(true);
    const snapshot = await getDocs(ref);
    const data = snapshot.docs.map(doc => {
      return { ...doc.data(), id: doc.id }
    });
    // console.log(data);
    setFeedList(data);
    setRefreshing(false);
  }

  useEffect(() => {
    loadFeed();
  }, []);

  const displayFeed = () => {
    return <View>
      <FlatList
        data={feedList}
        renderItem={({ item, index }) => <FeedCard data={item} feedList={feedList} setFeedList={setFeedList} index={index} />}
        keyExtractor={(item) => item.id}
        onRefresh={loadFeed}
        refreshing={refreshing}
      />
    </View>
  }

  return (
    <View style={styles.container}>
      {/* <ScrollView  > */}
      <TabList active={activeTab} setActive={setActiveTab} />
      {/* </ScrollView> */}
      {displayFeed()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
    padding: 10
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  iconButton: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  }
})

export default Feed;