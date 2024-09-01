import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native';
import app from '../firebaseConfig';
import { Button, Card, IconButton } from 'react-native-paper';
import Comments from './Comments';
// import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const db = getFirestore(app);

const FeedCard = ({ data, feedList, setFeedList, index }) => {

  const [showComments, setShowComments] = useState(false);

  const likePost = async () => {

    const ref = doc(db, 'socialpost', data.id);
    await setDoc(ref,
      { likes: (data.likes ? data.likes : 0) + 1 },
      { merge: true });

    const updateData = (await getDoc(ref)).data();

    const temp = feedList;
    temp[index] = { ...data, likes: updateData.likes };
    setFeedList([...temp]);

  }

  return <>
    <Card key={data.id} style={styles.card}>
      <Card.Title title={data.title} subtitle={data.description} />
      <Text>{new Date(data.postedOn).toDateString()}</Text>
      <Card.Cover source={{ uri: data.image }} />
      <View style={styles.iconContainer}>
        <View style={styles.iconButton}>
          <IconButton
            onPress={likePost}
            icon="heart-outline"
            mode="contained" />
          <Text>{data.likes ? data.likes : "0"}</Text>
        </View>
        <View style={styles.iconButton}>
          <IconButton
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

const Feed = () => {

  const [feedList, setFeedList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
      <Text>Feed Page</Text>
      {displayFeed()}


    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 10
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